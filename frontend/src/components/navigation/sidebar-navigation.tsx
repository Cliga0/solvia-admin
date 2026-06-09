"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navigationConfig, type NavigationItem, type NavigationSection } from "@/config/navigation";
import { Can } from "@/features/auth";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

export function SidebarNavigation() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-4 overflow-y-auto p-3">
      {navigationConfig.map((section) => (
        <NavigationSection
          key={section.key}
          section={section}
          pathname={pathname}
        />
      ))}
    </nav>
  );
}

function NavigationSection({
  section,
  pathname,
}: {
  section: NavigationSection;
  pathname: string;
}) {
  return (
    <div className="space-y-1">
      {section.label && (
        <p className="px-3 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          {section.label}
        </p>
      )}
      <div className="space-y-0.5">
        {section.items.map((item) => (
          <NavigationItemComponent
            key={item.key}
            item={item}
            pathname={pathname}
          />
        ))}
      </div>
    </div>
  );
}

function NavigationItemComponent({
  item,
  pathname,
  depth = 0,
}: {
  item: NavigationItem;
  pathname: string;
  depth?: number;
}) {
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
  const hasChildren = item.children && item.children.length > 0;

  const permission = item.permission;
  const permissions = item.permissions;
  const permissionMode = item.permissionMode;

  const content = (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
        depth > 0 && "text-xs py-1.5",
      )}
    >
      <item.icon className={cn("shrink-0", depth > 0 ? "h-3.5 w-3.5" : "h-4 w-4")} />
      <span className="truncate">{item.label}</span>
      {item.badge && (
        <Badge variant="secondary" className="ml-auto text-[10px]">
          {item.badge}
        </Badge>
      )}
      {isActive && !hasChildren && <ChevronRight className="ml-auto h-3 w-3 opacity-50" />}
    </Link>
  );

  if (permission) {
    return (
      <Can permission={permission}>
        {content}
        {hasChildren && (
          <div className="ml-4 mt-0.5 space-y-0.5 border-l border-border pl-2">
            {item.children!.map((child) => (
              <NavigationItemComponent
                key={child.key}
                item={child}
                pathname={pathname}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </Can>
    );
  }

  if (permissions && permissions.length > 0) {
    return (
      <Can permissions={permissions} mode={permissionMode}>
        {content}
        {hasChildren && (
          <div className="ml-4 mt-0.5 space-y-0.5 border-l border-border pl-2">
            {item.children!.map((child) => (
              <NavigationItemComponent
                key={child.key}
                item={child}
                pathname={pathname}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </Can>
    );
  }

  return (
    <>
      {content}
      {hasChildren && (
        <div className="ml-4 mt-0.5 space-y-0.5 border-l border-border pl-2">
          {item.children!.map((child) => (
            <NavigationItemComponent
              key={child.key}
              item={child}
              pathname={pathname}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </>
  );
}
