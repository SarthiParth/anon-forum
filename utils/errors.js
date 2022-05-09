const InsufficientPermissions = new Error(
    'You do not have enough permissions to perform this action'
);
InsufficientPermissions.status = 403;
InsufficientPermissions.name = 'InsufficientPermissions';

const DocumentNotFound = new Error('No document found with given _id');
DocumentNotFound.status = 404;
DocumentNotFound.name = 'DocumentNotFound';

const AuthFailed = new Error('Authentication failed');
AuthFailed.status = 403;
AuthFailed.name = 'AuthFailed';

module.exports = { InsufficientPermissions, DocumentNotFound, AuthFailed };
