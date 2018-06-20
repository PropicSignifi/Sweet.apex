const BooleanLiteral = node => {
    const {
        booleanValue,
    } = node;

    return `${booleanValue}`;
};

module.exports = BooleanLiteral;
