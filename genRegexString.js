module.exports.GenRegexQueryString = (query) => {
    query = query.trim().split(' ');
    let pattern = '';
    // /(?=.*\bclass\b)(?=.*\bexamination\b)(?=.*9)(?=.*\binformation\b).+/
    query.forEach(word => {
        pattern += `(?=.*${word})`;
    });

    pattern += '.+';

    return new RegExp(pattern);
}