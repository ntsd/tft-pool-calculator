export const uuidv4 = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export function round(num: number, decimal: number = 2): number {
  const div = Math.pow(10, decimal);
  return Math.round(num * div) / div;
}

export function groupByKey<T>(array: T[], callback: (value: T) => string) {
  const groups: { [name: string]: T[] } = {};

  array.forEach((element) => {
    const groupName = callback(element);
    if (groupName in groups) {
      groups[groupName].push(element);
    } else {
      groups[groupName] = [element];
    }
  });

  return groups;
}
