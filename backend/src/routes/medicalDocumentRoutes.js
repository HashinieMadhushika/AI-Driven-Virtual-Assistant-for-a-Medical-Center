import express from 'express';
import multer from 'multer';

import {
  askPatientMedicalDocumentQuestion,
  askPatientMedicalDocumentVoiceQuestion,
  getStaffMedicalDocumentDownload,
  listPatientSessionDocuments,
  listStaffMedicalDocuments,
  uploadPatientMedicalDocument,
} from '../controllers/medicalDocumentController.js';

import {
  authenticateToken,
  authorizeRole,
} from '../middleware/authMiddleware.js';

const router =
  express.Router();

const allowedMimeTypes =
  new Set([
    'application/pdf',
    'image/jpeg',
    'image/png',
  ]);

const voiceUpload =
  multer({
    storage:
      multer.memoryStorage(),
    limits: {
      fileSize:
        8 * 1024 * 1024,
      files:
        1,
    },
    fileFilter: (
      req,
      file,
      cb
    ) => {
      if (
        !String(
          file.mimetype ||
          ''
        ).startsWith(
          'audio/'
        )
      ) {
        return cb(
          new Error(
            'Only audio recordings are allowed.'
          )
        );
      }

      cb(
        null,
        true
      );
    },
  });

function uploadVoiceSingle(
  req,
  res,
  next
) {
  voiceUpload.single(
    'audio'
  )(
    req,
    res,
    (
      error
    ) => {
      if (error) {
        return res.status(400).json({
          error:
            error.message ||
            'Invalid voice recording.',
        });
      }

      next();
    }
  );
}

const upload =
  multer({
    storage:
      multer.memoryStorage(),
    limits: {
      fileSize:
        10 * 1024 * 1024,
      files:
        1,
    },
    fileFilter: (
      req,
      file,
      cb
    ) => {
      if (
        !allowedMimeTypes.has(
          file.mimetype
        )
      ) {
        return cb(
          new Error(
            'Only PDF, JPG, JPEG, and PNG medical documents are allowed.'
          )
        );
      }

      cb(
        null,
        true
      );
    },
  });

function uploadSingle(
  req,
  res,
  next
) {
  upload.single(
    'document'
  )(
    req,
    res,
    (
      error
    ) => {
      if (error) {
        return res.status(400).json({
          error:
            error.message ||
            'Invalid document upload.',
        });
      }

      next();
    }
  );
}

/*
 * Patient-facing upload/list endpoints.
 *
 * The floating chatbot is not an authenticated patient portal,
 * so the current session UUID + visitor email are used together.
 */
router.post(
  '/upload',
  uploadSingle,
  uploadPatientMedicalDocument
);

router.get(
  '/patient/:sessionId',
  listPatientSessionDocuments
);

router.post(
  '/:id/ask',
  askPatientMedicalDocumentQuestion
);

router.post(
  '/:id/ask-voice',
  uploadVoiceSingle,
  askPatientMedicalDocumentVoiceQuestion
);

/*
 * Staff-only access.
 *
 * With the current project schema, role-based authorization is the
 * available staff boundary. Add doctor-to-patient assignment checks
 * later if the project introduces that relationship.
 */
router.use(
  authenticateToken,
  authorizeRole(
    'admin',
    'doctor'
  )
);

router.get(
  '/',
  listStaffMedicalDocuments
);

router.get(
  '/:id/download',
  getStaffMedicalDocumentDownload
);

export default router;
