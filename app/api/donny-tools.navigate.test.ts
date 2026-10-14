import { describe, expect, it } from "vitest";
import { getDonnyTools } from "./donny-tools";

type NavigateExecute = (
  input: { destination?: string; section?: string; label?: string },
  options: { toolCallId: string; messages: [] },
) => Promise<{ navigated: boolean; url: string }>;

async function navigate(destination: string, section?: string) {
  const tools = await getDonnyTools({ enableMcp: false, allowStdio: false });
  const execute = tools["studio.navigateTo"]?.execute as unknown as NavigateExecute;
  return execute({ destination, section }, { toolCallId: "t1", messages: [] });
}

describe("studio.navigateTo", () => {
  it("keeps the home-page section anchor for services", async () => {
    expect(await navigate("services")).toEqual({ navigated: true, url: "/#services" });
    expect(await navigate("palvelut")).toEqual({ navigated: true, url: "/#services" });
  });

  it("never sends visitors to a path that is not a page", async () => {
    expect(await navigate("/services")).toEqual({ navigated: true, url: "/#services" });
    expect(await navigate("/no-such-page")).toEqual({ navigated: false, url: "/" });
  });

  it("navigates to real pages and keeps an explicit section", async () => {
    expect(await navigate("/pricing")).toEqual({ navigated: true, url: "/pricing" });
    expect(await navigate("pricing", "calculator")).toEqual({
      navigated: true,
      url: "/pricing#calculator",
    });
  });
});
