const SoqlLiteral = node => {
    const {
        value,
    } = node;

    return `${value}`;
};

module.exports = SoqlLiteral;
