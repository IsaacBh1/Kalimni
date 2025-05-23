const getAvatarUrl = (name = " ") => {
  const [first = "", last = ""] = name.split(" ");
  const initials = `${first.charAt(0)}${last.charAt(0)}`;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = (hash & 0x00ffffff).toString(16).padStart(6, "0");
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    initials
  )}&background=${color}&color=fff&size=128`;
};

export default getAvatarUrl;
