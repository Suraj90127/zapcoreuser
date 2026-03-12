import ipaddr from "ipaddr.js";

export const isIpAllowed = (requestIp, ipv4List = [], ipv6List = []) => {

  // IPv6
  if (ipaddr.isValid(requestIp) && ipaddr.parse(requestIp).kind() === "ipv6") {
    const req = ipaddr.parse(requestIp).toNormalizedString().split(":").slice(0, 4).join(":");

    return ipv6List.some(ip =>
      ip.toLowerCase().startsWith(req)
    );
  }

  // IPv4 exact
  return ipv4List.includes(requestIp);
};
