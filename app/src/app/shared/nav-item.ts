export class NavItem {
  displayName: string | null = null;
  disabled?: boolean | null = null;
  iconName: string | null = null;
  route?: string | null = null;
  expanded?: boolean = false;
  children?: NavItem[] | null = null;
}
