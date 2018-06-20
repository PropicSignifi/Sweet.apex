const PrimitiveType = node => {
    const {
        primitiveTypeCode,
    } = node;

    return `${primitiveTypeCode}`;
};

module.exports = PrimitiveType;
