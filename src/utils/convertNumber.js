const convertNumber = (number) => {
  const suffixes = [
    { value: 1e12, suffix: "T" },
    { value: 1e9, suffix: "B" },
    { value: 1e6, suffix: "M" },
    { value: 1e3, suffix: "K" },
  ];

  for (const { value, suffix } of suffixes) {
    if (number >= value) {
      return (number / value).toFixed(1).replace(/\.0$/, "") + suffix;
    }
  }

  return number.toString();
};

module.exports = convertNumber;
