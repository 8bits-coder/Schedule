const colorClasses = {
  blue: "bg-blue-500 hover:bg-blue-600",
  green: "bg-green-500 hover:bg-green-600",
  purple: "bg-purple-500 hover:bg-purple-600",
  orange: "bg-orange-500 hover:bg-orange-600",
  teal: "bg-teal-500 hover:bg-teal-600",
};

export const Links = {
  Delivery: "/delivery",
  Items: "/items",
  Locations: "/locations",
  Receipts: "/receipts",
  TimeKeeping: "/timekeeping",
  TimeOffRequest: "/timeoffrequests",
};

class NavigationLink {
  constructor(
    public name: keyof typeof Links,
    public link: (typeof Links)[keyof typeof Links],
    public color: keyof typeof colorClasses,
  ) {}
}

export const NavigationItems: NavigationLink[] = [
  new NavigationLink("Delivery", Links.Delivery, "blue"),
  new NavigationLink("Items", Links.Items, "green"),
  new NavigationLink("Locations", Links.Locations, "purple"),
  new NavigationLink("Receipts", Links.Receipts, "orange"),
  new NavigationLink("TimeKeeping", Links.TimeKeeping, "teal"),
  new NavigationLink("TimeOffRequest", Links.TimeOffRequest, "blue"),
];
