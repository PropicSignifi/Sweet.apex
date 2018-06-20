const ThisExpression = node => {
    const {
        qualifier,
    } = node;

    return qualifier ? `${qualifier}.this` : `this`;
};

module.exports = ThisExpression;
