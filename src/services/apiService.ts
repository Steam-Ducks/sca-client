import { userService } from "./userService";
import { consolidatedService } from "./consolidatedService";
import { budgetService } from "./budgetService";

export const apiService = {
  user: userService,
  consolidated: consolidatedService,
  budget: budgetService,
};
