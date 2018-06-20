const SimpleName = node => {
    const {
        identifier,
    } = node;

    return identifier;
};

module.exports = SimpleName;
