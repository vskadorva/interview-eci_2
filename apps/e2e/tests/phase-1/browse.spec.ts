import { test, expect } from "../../src/fixtures/test.js";
import { BrowsePage } from "../../src/pages/browse.page.js";
import { PersonaDetailPage } from "../../src/pages/persona-detail.page.js";
import { REFACTOR_REX } from "../../src/constants.js";

test.describe("Browse regressions (C-03, H-09)", () => {
  test("browse cards show correct monthly price", async ({ page }) => {
    const browse = new BrowsePage(page);
    await browse.goto();
    await browse.expectPersonaPrice(REFACTOR_REX.name, REFACTOR_REX.browsePrice);

    await expect(page.getByText("$4999.00/mo")).toHaveCount(0);
  });

  test("persona detail price matches browse card price", async ({ page }) => {
    const browse = new BrowsePage(page);
    const detail = new PersonaDetailPage(page);

    await browse.goto();
    await browse.personaCard(REFACTOR_REX.name).click();
    await detail.expectPrice(REFACTOR_REX.detailPrice);
  });

  test("specialty filter updates results without stale cache", async ({
    page,
  }) => {
    const browse = new BrowsePage(page);
    await browse.goto();

    await expect(browse.personaCard("Zero-Day Zara")).toBeVisible();

    await browse.filterBySpecialty("Engineering");
    await expect(page).toHaveURL(/specialty=Engineering/);
    await browse.expectEngineeringFilterResults();
  });
});
