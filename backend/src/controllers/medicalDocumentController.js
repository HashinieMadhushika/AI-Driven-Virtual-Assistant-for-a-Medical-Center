import crypto from 'crypto';
import { Op } from 'sequelize';

import MedicalDocument from '../models/MedicalDocument.js';
import Patient from '../models/Patient.js';
import ChatSession from '../models/ChatSession.js';

import {
  createMedicalDocumentSignedUrl,
  deleteMedicalDocument,
  downloadMedicalDocument,
  uploadMedicalDocument,
} from '../services/medicalDocumentStorageService.js';

import {
  askGeminiAboutMedicalDocument,
} from '../services/medicalDocumentAiService.js';

import {
  synthesizeMedicalDocumentReply,
  transcribeMedicalDocumentAudio,
} from '../services/medicalDocumentVoiceService.js';

const ALLOWED_TYPES =
  new Set([
    'PRESCRIPTION',
    'MEDICAL_REPORT',
    'LAB_REPORT',
    'OTHER_MEDICAL_DOCUMENT',
  ]);

const EXTENSION_BY_MIME = {
  'application/pdf':
    'pdf',
  'image/jpeg':
    'jpg',
  'image/png':
    'png',
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function normalizeEmail(
  value
) {
  return String(
    value ||
    ''
  )
    .trim()
    .toLowerCase();
}

function cleanText(
  value,
  maxLength
) {
  return String(
    value ||
    ''
  )
    .trim()
    .slice(
      0,
      maxLength
    );
}

function isDocumentExitRequest(
  value
) {
  const text =
    String(
      value ||
      ''
    )
      .toLowerCase()
      .replace(
        /[.,!?]/g,
        ' '
      )
      .replace(
        /\s+/g,
        ' '
      )
      .trim();

  return /^(exit document mode|exit report mode|stop document mode|stop checking (?:the )?(?:document|report|prescription)|finish (?:the )?(?:document|report|prescription)|done with (?:the )?(?:document|report|prescription)|go back to normal assistant|return to normal assistant)$/.test(
    text
  );
}

function publicDocument(
  document
) {
  const value =
    document?.toJSON
      ? document.toJSON()
      : document;

  return {
    id:
      value.id,
    sessionId:
      value.sessionId,
    patientId:
      value.patientId,
    firstName:
      value.firstName,
    email:
      value.email,
    documentType:
      value.documentType,
    originalFileName:
      value.originalFileName,
    mimeType:
      value.mimeType,
    fileSize:
      value.fileSize,
    status:
      value.status,
    uploadedAt:
      value.uploadedAt,
    createdAt:
      value.createdAt,
  };
}

async function ensureChatSession({
  sessionId,
  firstName,
  email,
}) {
  const [
    session,
    created,
  ] =
    await ChatSession.findOrCreate({
      where: {
        id:
          sessionId,
      },
      defaults: {
        id:
          sessionId,
        firstName,
        email,
        source:
          'floating-chat',
      },
    });

  if (!created) {
    if (
      normalizeEmail(
        session.email
      ) !==
      normalizeEmail(
        email
      )
    ) {
      throw new Error(
        'The chat session does not belong to this email address.'
      );
    }

    await session.update({
      firstName,
    });
  }

  return session;
}

export const uploadPatientMedicalDocument =
  async (
    req,
    res
  ) => {
    let uploadedStoragePath =
      '';

    try {
      const sessionId =
        cleanText(
          req.body?.sessionId,
          80
        );

      const firstName =
        cleanText(
          req.body?.firstName,
          120
        );

      const email =
        normalizeEmail(
          req.body?.email
        );

      const documentType =
        cleanText(
          req.body?.documentType,
          40
        ).toUpperCase();

      if (
        !UUID_PATTERN.test(
          sessionId
        ) ||
        !firstName ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          email
        )
      ) {
        return res.status(400).json({
          error:
            'Valid sessionId, firstName, and email are required.',
        });
      }

      if (
        !ALLOWED_TYPES.has(
          documentType
        )
      ) {
        return res.status(400).json({
          error:
            'Unsupported medical document type.',
        });
      }

      if (!req.file) {
        return res.status(400).json({
          error:
            'A PDF, JPG, JPEG, or PNG medical document is required.',
        });
      }

      const extension =
        EXTENSION_BY_MIME[
          req.file.mimetype
        ];

      if (!extension) {
        return res.status(415).json({
          error:
            'Only PDF, JPG, JPEG, and PNG files are allowed.',
        });
      }

      await ensureChatSession({
        sessionId,
        firstName,
        email,
      });

      const patient =
        await Patient.findOne({
          where: {
            email: {
              [Op.iLike]:
                email,
            },
          },
          attributes: [
            'id',
          ],
        });

      const emailHash =
        crypto
          .createHash(
            'sha256'
          )
          .update(
            email
          )
          .digest(
            'hex'
          )
          .slice(
            0,
            24
          );

      const now =
        new Date();

      const year =
        String(
          now.getUTCFullYear()
        );

      const month =
        String(
          now.getUTCMonth() +
          1
        ).padStart(
          2,
          '0'
        );

      const objectId =
        crypto.randomUUID();

      uploadedStoragePath =
        `patients/${emailHash}/${year}/${month}/${objectId}.${extension}`;

      const storage =
        await uploadMedicalDocument({
          storagePath:
            uploadedStoragePath,
          buffer:
            req.file.buffer,
          mimeType:
            req.file.mimetype,
        });

      let document;

      try {
        document =
          await MedicalDocument.create({
            sessionId,
            patientId:
              patient?.id ??
              null,
            firstName,
            email,
            documentType,
            originalFileName:
              cleanText(
                req.file.originalname,
                255
              ) ||
              `medical-document.${extension}`,
            mimeType:
              req.file.mimetype,
            fileSize:
              req.file.size,
            storageBucket:
              storage.bucket,
            storagePath:
              storage.storagePath,
            status:
              'UPLOADED',
            uploadedAt:
              now,
          });
      } catch (databaseError) {
        await deleteMedicalDocument({
          storagePath:
            uploadedStoragePath,
        });

        throw databaseError;
      }

      return res.status(201).json({
        success:
          true,
        reply:
          'Your medical document was uploaded securely. It is stored privately and can be reviewed by authorized Medicare staff.',
        documentResult: {
          documentType,
          success:
            true,
          message:
            'Uploaded securely',
          timestamp:
            document.uploadedAt,
          data: {
            documentId:
              document.id,
            status:
              document.status,
            originalFileName:
              document.originalFileName,
            mimeType:
              document.mimeType,
            fileSize:
              document.fileSize,
            uploadedAt:
              document.uploadedAt,
          },
        },
      });
    } catch (error) {
      console.error(
        'Failed to upload medical document:',
        error
      );

      return res.status(500).json({
        success:
          false,
        error:
          error instanceof Error
            ? error.message
            : 'Could not upload medical document.',
      });
    }
  };

export const listPatientSessionDocuments =
  async (
    req,
    res
  ) => {
    try {
      const sessionId =
        cleanText(
          req.params.sessionId,
          80
        );

      const email =
        normalizeEmail(
          req.query.email
        );

      if (
        !UUID_PATTERN.test(
          sessionId
        ) ||
        !email
      ) {
        return res.status(400).json({
          error:
            'Valid sessionId and email are required.',
        });
      }

      const documents =
        await MedicalDocument.findAll({
          where: {
            sessionId,
            email,
          },
          order: [
            [
              'uploadedAt',
              'DESC',
            ],
          ],
        });

      return res.json({
        documents:
          documents.map(
            publicDocument
          ),
      });
    } catch (error) {
      console.error(
        'Failed to list patient documents:',
        error
      );

      return res.status(500).json({
        error:
          'Could not load uploaded documents.',
      });
    }
  };

export const listStaffMedicalDocuments =
  async (
    req,
    res
  ) => {
    try {
      const documentType =
        cleanText(
          req.query.documentType,
          40
        ).toUpperCase();

      const email =
        normalizeEmail(
          req.query.email
        );

      const where =
        {};

      if (
        documentType &&
        ALLOWED_TYPES.has(
          documentType
        )
      ) {
        where.documentType =
          documentType;
      }

      if (email) {
        where.email = {
          [Op.iLike]:
            email,
        };
      }

      const documents =
        await MedicalDocument.findAll({
          where,
          order: [
            [
              'uploadedAt',
              'DESC',
            ],
          ],
          limit:
            100,
        });

      return res.json({
        documents:
          documents.map(
            publicDocument
          ),
      });
    } catch (error) {
      console.error(
        'Failed to list staff medical documents:',
        error
      );

      return res.status(500).json({
        error:
          'Could not load medical documents.',
      });
    }
  };

export const getStaffMedicalDocumentDownload =
  async (
    req,
    res
  ) => {
    try {
      const document =
        await MedicalDocument.findByPk(
          req.params.id
        );

      if (!document) {
        return res.status(404).json({
          error:
            'Medical document not found.',
        });
      }

      const signed =
        await createMedicalDocumentSignedUrl({
          storagePath:
            document.storagePath,
          expiresIn:
            300,
        });

      return res.json({
        document:
          publicDocument(
            document
          ),
        downloadUrl:
          signed.url,
        expiresIn:
          signed.expiresIn,
      });
    } catch (error) {
      console.error(
        'Failed to create medical document download link:',
        error
      );

      return res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : 'Could not create secure document link.',
      });
    }
  };


export const askPatientMedicalDocumentQuestion =
  async (
    req,
    res
  ) => {
    try {
      const documentId =
        cleanText(
          req.params.id,
          80
        );

      const sessionId =
        cleanText(
          req.body?.sessionId,
          80
        );

      const email =
        normalizeEmail(
          req.body?.email
        );

      const question =
        cleanText(
          req.body?.question,
          1500
        );

      if (
        !documentId ||
        !UUID_PATTERN.test(
          sessionId
        ) ||
        !email ||
        !question
      ) {
        return res.status(400).json({
          error:
            'documentId, valid sessionId, email, and question are required.',
        });
      }

      const document =
        await MedicalDocument.findOne({
          where: {
            id:
              documentId,
            sessionId,
            email,
          },
        });

      if (!document) {
        return res.status(404).json({
          error:
            'Medical document not found for this chat session.',
        });
      }

      const stored =
        await downloadMedicalDocument({
          storagePath:
            document.storagePath,
        });

      const analysis =
        await askGeminiAboutMedicalDocument({
          documentType:
            document.documentType,
          question,
          buffer:
            stored.buffer,
          mimeType:
            document.mimeType ||
            stored.mimeType,
        });

      return res.json({
        success:
          true,
        intent:
          'medical_document_question',
        reply:
          analysis.reply,
        documentId:
          document.id,
        documentType:
          document.documentType,
        originalFileName:
          document.originalFileName,
        model:
          analysis.model,
      });
    } catch (error) {
      console.error(
        'Failed to answer medical document question:',
        error
      );

      return res.status(500).json({
        success:
          false,
        error:
          error instanceof Error
            ? error.message
            : 'Could not answer the medical document question.',
      });
    }
  };


export const askPatientMedicalDocumentVoiceQuestion =
  async (
    req,
    res
  ) => {
    try {
      const documentId =
        cleanText(
          req.params.id,
          80
        );

      const sessionId =
        cleanText(
          req.body?.sessionId,
          80
        );

      const email =
        normalizeEmail(
          req.body?.email
        );

      if (
        !documentId ||
        !UUID_PATTERN.test(
          sessionId
        ) ||
        !email
      ) {
        return res.status(400).json({
          error:
            'documentId, valid sessionId, and email are required.',
        });
      }

      if (!req.file) {
        return res.status(400).json({
          error:
            'A voice recording is required.',
        });
      }

      const document =
        await MedicalDocument.findOne({
          where: {
            id:
              documentId,
            sessionId,
            email,
          },
        });

      if (!document) {
        return res.status(404).json({
          error:
            'Medical document not found for this chat session.',
        });
      }

      const transcript =
        await transcribeMedicalDocumentAudio({
          buffer:
            req.file.buffer,
          mimeType:
            req.file.mimetype ||
            'audio/webm',
          fileName:
            req.file.originalname ||
            'medical-document-question.webm',
        });

      if (
        isDocumentExitRequest(
          transcript
        )
      ) {
        const reply =
          'Document review mode has ended. You can now ask normal Medicare AI questions, book or manage appointments, find doctors, use human support, or upload another medical document.';

        let audio =
          null;

        try {
          audio =
            await synthesizeMedicalDocumentReply(
              reply
            );
        } catch (
          ttsError
        ) {
          console.warn(
            '[medical document voice] exit TTS failed:',
            ttsError
          );
        }

        return res.json({
          success:
            true,
          intent:
            'medical_document_exit',
          transcript,
          reply,
          documentId:
            document.id,
          documentType:
            document.documentType,
          originalFileName:
            document.originalFileName,
          voiceMode:
            true,
          audioBase64:
            audio?.audioBase64 ||
            '',
          mimeType:
            audio?.mimeType ||
            'audio/mpeg',
        });
      }

      const stored =
        await downloadMedicalDocument({
          storagePath:
            document.storagePath,
        });

      const analysis =
        await askGeminiAboutMedicalDocument({
          documentType:
            document.documentType,
          question:
            transcript,
          buffer:
            stored.buffer,
          mimeType:
            document.mimeType ||
            stored.mimeType,
        });

      let audio =
        null;

      try {
        audio =
          await synthesizeMedicalDocumentReply(
            analysis.reply
          );
      } catch (
        ttsError
      ) {
        console.warn(
          '[medical document voice] TTS failed:',
          ttsError
        );
      }

      return res.json({
        success:
          true,
        intent:
          'medical_document_question',
        transcript,
        reply:
          analysis.reply,
        documentId:
          document.id,
        documentType:
          document.documentType,
        originalFileName:
          document.originalFileName,
        model:
          analysis.model,
        finishReason:
          analysis.finishReason,
        voiceMode:
          true,
        audioBase64:
          audio?.audioBase64 ||
          '',
        mimeType:
          audio?.mimeType ||
          'audio/mpeg',
      });
    } catch (error) {
      console.error(
        'Failed to answer voice medical document question:',
        error
      );

      return res.status(500).json({
        success:
          false,
        error:
          error instanceof Error
            ? error.message
            : 'Could not answer the voice medical document question.',
      });
    }
  };
