const DEFAULT_BUCKET =
  process.env.SUPABASE_MEDICAL_DOCUMENTS_BUCKET?.trim() ||
  'medical-documents';

let bucketReady = false;

function getConfig() {
  const supabaseUrl =
    String(
      process.env.SUPABASE_URL ||
      ''
    )
      .trim()
      .replace(/\/$/, '');

  const serviceRoleKey =
    String(
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      ''
    ).trim();

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Supabase Storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env.'
    );
  }

  return {
    supabaseUrl,
    serviceRoleKey,
    bucket:
      DEFAULT_BUCKET,
  };
}

function authHeaders(
  serviceRoleKey
) {
  return {
    apikey:
      serviceRoleKey,
    Authorization:
      `Bearer ${serviceRoleKey}`,
  };
}

async function readError(
  response
) {
  try {
    const data =
      await response.json();

    return (
      data?.message ||
      data?.error ||
      data?.error_description ||
      JSON.stringify(
        data
      )
    );
  } catch {
    try {
      return await response.text();
    } catch {
      return `HTTP ${response.status}`;
    }
  }
}

export async function ensureMedicalDocumentsBucket() {
  if (bucketReady) {
    return DEFAULT_BUCKET;
  }

  const {
    supabaseUrl,
    serviceRoleKey,
    bucket,
  } = getConfig();

  const lookup =
    await fetch(
      `${supabaseUrl}/storage/v1/bucket/${encodeURIComponent(
        bucket
      )}`,
      {
        headers:
          authHeaders(
            serviceRoleKey
          ),
      }
    );

  if (lookup.ok) {
    const existing =
      await lookup.json();

    if (
      existing?.public ===
      true
    ) {
      throw new Error(
        `Supabase Storage bucket "${bucket}" must be private.`
      );
    }

    bucketReady =
      true;

    return bucket;
  }

  if (
    lookup.status !==
    404
  ) {
    throw new Error(
      `Unable to check Supabase Storage bucket: ${await readError(
        lookup
      )}`
    );
  }

  const create =
    await fetch(
      `${supabaseUrl}/storage/v1/bucket`,
      {
        method:
          'POST',
        headers: {
          ...authHeaders(
            serviceRoleKey
          ),
          'Content-Type':
            'application/json',
        },
        body:
          JSON.stringify({
            id:
              bucket,
            name:
              bucket,
            public:
              false,
            file_size_limit:
              10 * 1024 * 1024,
            allowed_mime_types: [
              'application/pdf',
              'image/jpeg',
              'image/png',
            ],
          }),
      }
    );

  if (!create.ok) {
    throw new Error(
      `Unable to create private Supabase Storage bucket: ${await readError(
        create
      )}`
    );
  }

  bucketReady =
    true;

  return bucket;
}

export async function uploadMedicalDocument({
  storagePath,
  buffer,
  mimeType,
}) {
  const {
    supabaseUrl,
    serviceRoleKey,
    bucket,
  } = getConfig();

  await ensureMedicalDocumentsBucket();

  const response =
    await fetch(
      `${supabaseUrl}/storage/v1/object/${encodeURIComponent(
        bucket
      )}/${storagePath
        .split('/')
        .map(
          encodeURIComponent
        )
        .join('/')}`,
      {
        method:
          'POST',
        headers: {
          ...authHeaders(
            serviceRoleKey
          ),
          'Content-Type':
            mimeType,
          'x-upsert':
            'false',
        },
        body:
          buffer,
      }
    );

  if (!response.ok) {
    throw new Error(
      `Unable to upload medical document: ${await readError(
        response
      )}`
    );
  }

  return {
    bucket,
    storagePath,
  };
}

export async function deleteMedicalDocument({
  storagePath,
}) {
  const {
    supabaseUrl,
    serviceRoleKey,
    bucket,
  } = getConfig();

  const response =
    await fetch(
      `${supabaseUrl}/storage/v1/object/${encodeURIComponent(
        bucket
      )}`,
      {
        method:
          'DELETE',
        headers: {
          ...authHeaders(
            serviceRoleKey
          ),
          'Content-Type':
            'application/json',
        },
        body:
          JSON.stringify({
            prefixes: [
              storagePath,
            ],
          }),
      }
    );

  if (!response.ok) {
    console.error(
      '[medical documents] failed to clean up uploaded object:',
      await readError(
        response
      )
    );
  }
}

export async function createMedicalDocumentSignedUrl({
  storagePath,
  expiresIn = 300,
}) {
  const {
    supabaseUrl,
    serviceRoleKey,
    bucket,
  } = getConfig();

  const safeExpiresIn =
    Math.min(
      Math.max(
        Number(
          expiresIn
        ) || 300,
        60
      ),
      900
    );

  const response =
    await fetch(
      `${supabaseUrl}/storage/v1/object/sign/${encodeURIComponent(
        bucket
      )}/${storagePath
        .split('/')
        .map(
          encodeURIComponent
        )
        .join('/')}`,
      {
        method:
          'POST',
        headers: {
          ...authHeaders(
            serviceRoleKey
          ),
          'Content-Type':
            'application/json',
        },
        body:
          JSON.stringify({
            expiresIn:
              safeExpiresIn,
          }),
      }
    );

  if (!response.ok) {
    throw new Error(
      `Unable to create secure document link: ${await readError(
        response
      )}`
    );
  }

  const data =
    await response.json();

  const signedPath =
    data?.signedURL ||
    data?.signedUrl ||
    data?.signed_url;

  if (!signedPath) {
    throw new Error(
      'Supabase Storage did not return a signed document URL.'
    );
  }

  const url =
    String(
      signedPath
    ).startsWith(
      'http'
    )
      ? String(
          signedPath
        )
      : `${supabaseUrl}/storage/v1${String(
          signedPath
        ).startsWith('/')
          ? ''
          : '/'}${signedPath}`;

  return {
    url,
    expiresIn:
      safeExpiresIn,
  };
}


export async function downloadMedicalDocument({
  storagePath,
}) {
  const {
    supabaseUrl,
    serviceRoleKey,
    bucket,
  } = getConfig();

  const response =
    await fetch(
      `${supabaseUrl}/storage/v1/object/authenticated/${encodeURIComponent(
        bucket
      )}/${storagePath
        .split('/')
        .map(
          encodeURIComponent
        )
        .join('/')}`,
      {
        headers:
          authHeaders(
            serviceRoleKey
          ),
        cache:
          'no-store',
      }
    );

  if (!response.ok) {
    throw new Error(
      `Unable to read medical document: ${await readError(
        response
      )}`
    );
  }

  const arrayBuffer =
    await response.arrayBuffer();

  return {
    buffer:
      Buffer.from(
        arrayBuffer
      ),
    mimeType:
      response.headers.get(
        'content-type'
      ) ||
      'application/octet-stream',
  };
}
