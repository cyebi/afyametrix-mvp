export type AppRole =
  | "CHPS"
  | "DHIO"
  | "DSNO"
  | "REGIONAL"
  | "MINISTRY"
  | "DONOR";

export type AuthUser = {
  id: string;
  role: AppRole;
  districtId?: string;
  facilityId?: string;
};
