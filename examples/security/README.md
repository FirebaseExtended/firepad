This directory contains examples of how you could set up your security for Firepad.  They're not exhaustive.

# secret-url.json
Example demonstrating how to secure Firepad by using secret URLs (you need the secret URL to be able to
find / modify the Firebase data.

# validate-auth.json
Example demonstrating how to require that users be authenticated to read and write to the Firepad.  Also ensures that
all edits correctly include the authenticated user's id (i.e. prevent users from spoofing each other).