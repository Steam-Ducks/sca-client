import { userService } from "./userService";
import { healthService } from "./healthService";
import { consolidatedService } from "./consolidatedService";
import { budgetService } from "./budgetService";

export const apiService = {
  user: userService,
  health: healthService,
  consolidated: consolidatedService,
  budget: budgetService,
};
