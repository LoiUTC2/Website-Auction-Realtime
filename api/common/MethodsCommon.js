const formatResponse = (success, data, message, metadata = {}) => {
    return {
        success: success,
        message: message || (success ? 'Operation successful' : 'Operation failed'),
        data: data || {},
        metadata: metadata
    };
};

module.exports = { formatResponse };