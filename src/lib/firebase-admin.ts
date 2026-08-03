import * as admin from 'firebase-admin';

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID || "king-classes-13",
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk-fbsvc@king-classes-13.iam.gserviceaccount.com",
  privateKey: (process.env.FIREBASE_PRIVATE_KEY || `-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDeTcH9Fdc/cv5k\nX+P03mSv7aUnsyL8l1kirTPOrozo8c34g20D8n88H3HOv1hf1c4yJ2H94oKoXNru\nsPdY5Ql+lgRzzEqfc+4JU+O8n5D1mD407ubrOQ/1MJ+uXyhDHb4qcvWIEpJfVW26\nxeBcVcHD7YvSypz26+9n0vRgdRnwUG3z33LCvmMF4kNtg3IO0YH9SahnSN8E7Kkt\n+A9lw3MVqk7Mvn2EAvKnhjSOrFXQqw6OunTk0xW1eiqEDSYva5sKoV/C/oObgYF1\nLy0iap926AGdWJar8DCtkygi7a/MatsVoCv0oxMU7phKSTEPWAjbn022Lxh9GZFb\nhg6rjNE9AgMBAAECggEAC7lFlQORG71EicYd10TgQf/yMQ8LNg+ESaYhQJHniARy\nlJvXxLjF+YV+AsWIE1vK+U2m5xUKR3dIK4TlMoi3sLeYKgQ43kJmqBLGxKSUqEMc\nar27q2WRwCBNl4xYqvt3UzVHWiMCmaj/dbVoUO5L3vmY4WfCkeoc8NiI/0pFsSzv\nh1J7vzVAfhTfkG3WSY0It1ZVuZ97xkbl12wjefdSbFAc2b8zZyRKENomip2mcACb\nglrKO53dssVMyvgcu0ZDAiLa3vYYcgjNC8HQhesYn8mJYQUApGMPfc7rC4rIJEci\nlCog7DTXbe78IRlXK240XZTVJnkF/KVKKkNzcfXfMQKBgQD1jHKcnPVsphNgxD2U\nXvWz5UbxHF2TSQb8xbIu7yHbmEkEkXGOvBcUsGIqw1i51zZx8ykmaTBa7WzEJ7xW\n1YYy32G77fPVCuoLM0Yyslult11bO1atGip5EYqoWwR2eq86xa/fOXK+JVlY2Z4N\n9uxdsrU56+wPSmKginlAGa1ekQKBgQDnxAdWt3pvSQYAEAg0zNBvKm5xvsjAGFvz\n0qfXFgFHOfAVFEfwxiEk5Owfz1lh96MzOq6c34KPemjxrrSjxSXrF8wS3/Nppxva\nlEjp3boW9Vvv8or27bHzK6P/rpekYZTmHkwZ+CVzvyFAZZQ2ISbIAcXb626JKGYI\n3dF7HpR17QKBgQCqptiEpcUfpHA1QU12z2Q9iWv7Z/ZUxV0Y0aDbY5CJWFXu2dIt\nG+WCmG8xPyBrz/ljylXf/xz/JKEB1ofbZXxl4L/A50gd2P79l74Cv9hX3I8CN8Qu\ne8/m4l0WUmNQoEUmOHvZTMjFA5oL2PoyxFhTaj7vKVqe6diPsI1CElZeMQKBgH5r\nayVeB6bUSjWWiSNj5P3+QyhATPibUOz6pxqnoiLb851L5sHrEQEy7amcTMEndxnm\nlIB1Wp4wwzWxek8qprhJzsMs7XVf9c2QvQT0MSF8zJ1hy3NNzJc74sUA0y6TG8k6\nFYDE3oj4ZIbf4ax1ANZwQSDolu6x3pZPiIiD8a8xAoGAPh0EJHsfaE9dKNZ37C6f\nOot+slzFLEUifhf8szMmGqOf9qc4jOu6J6huTqSSXjbNTmU9ccyjY8LqoebehRpN\nvVp8rkezKltkk+dkQHBCpEyhhtbeRpHgKu4yhBYO0Yq7SlCDV6yrmRIJmOVM8vK/\nXMyMQL68Tt149KNXFB3YHxY=\n-----END PRIVATE KEY-----\n`).replace(/\\n/g, '\n'),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const adminMessaging = admin.messaging();
