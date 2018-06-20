const NumberLiteral = node => {
    const {
        token,
    } = node;

    return token;
};

module.exports = NumberLiteral;
