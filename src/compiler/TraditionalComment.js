const TraditionalComment = (node, context) => {
    const {
        comment,
    } = node;

    const {
        lines,
        indent,
    } = context;

    lines.push(indent + comment);
};

module.exports = TraditionalComment;
