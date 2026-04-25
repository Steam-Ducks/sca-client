import { userService } from "./userService";
import { healthService } from "./healthService";
import { consolidatedService } from "./consolidatedService";

export const apiService = {
  user: userService,
  health: healthService,
  consolidated: consolidatedService,
};
