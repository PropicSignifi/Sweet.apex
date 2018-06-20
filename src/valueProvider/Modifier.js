const Modifier = node => {
    const {
        keyword,
    } = node;

    return `${keyword}`;
};

module.exports = Modifier;
