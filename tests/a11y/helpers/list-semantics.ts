import type { Page } from "@playwright/test";

export interface ListSemanticsIssue {
  selector: string;
  tagName: string;
  listStyleType: string;
  role: string | null;
}

/**
 * Safari + VoiceOver drops list semantics when list-style-type is `none`.
 * a11y.ing recommends `list-style-type: " "` (space) as the CSS fix.
 */
export async function findBrokenListSemantics(
  page: Page
): Promise<ListSemanticsIssue[]> {
  return page.evaluate(() => {
    const issues: ListSemanticsIssue[] = [];
    const lists = document.querySelectorAll("ul, ol");

    lists.forEach((list, index) => {
      const style = window.getComputedStyle(list);
      const listStyleType = style.listStyleType;
      const role = list.getAttribute("role");

      // a11y.ing: list-style:none strips list semantics in Safari VO unless
      // list-style-type is set to a space character or role="list" is present.
      const hasExplicitListRole = role === "list";

      if (listStyleType === "none" && !hasExplicitListRole) {
        const id = list.id ? `#${list.id}` : "";
        const testId = list.getAttribute("data-testid");
        const selector = testId
          ? `${list.tagName.toLowerCase()}[data-testid="${testId}"]`
          : `${list.tagName.toLowerCase()}${id || `:nth-of-type(${index + 1})`}`;

        issues.push({
          selector,
          tagName: list.tagName.toLowerCase(),
          listStyleType,
          role,
        });
      }
    });

    return issues;
  });
}
