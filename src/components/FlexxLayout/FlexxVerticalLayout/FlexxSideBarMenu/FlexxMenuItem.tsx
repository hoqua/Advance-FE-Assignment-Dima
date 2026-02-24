'use client';
import React, {useMemo} from 'react';

import Link from 'next/link';
import {Session} from '@/domain/Session';
import {MenuItem, SubMenu} from '@menu/vertical-menu';
import FlexxIcon from '@components/FlexxIcon/FlexxIcon';
import {useUserSession} from '@components/UserSessionProvider/UserSessionProvider';
import {FlexxMenuItem} from '@components/FlexxLayout/FlexxVerticalLayout/FlexxSideBarMenu/flexx-sidebar-menu.domain';

const renderMenuItems = (items: FlexxMenuItem[], session?: Session) => {
  return items.map((item, index) => {
    if (item.subMenu) {
      return (
        <SubMenu
          key={`${item.id}.${index}`}
          label={item.title}
          icon={<FlexxIcon icon={item.icon} width={20} height={20} />}
          {...(item.href
            ? {
                href: item.href,
                component: Link,
              }
            : {})}
        >
          {renderMenuItems(item.subMenu, session)}
        </SubMenu>
      );
    }

    if (item.persistentSubMenu) {
      return (
        <SubMenu
          persistent
          key={`${item.id}.${index}`}
          label={item.title}
          icon={<FlexxIcon icon={item.icon} width={20} height={20} />}
          {...(item.href
            ? {
                href: item.href,
                component: Link,
              }
            : {})}
        >
          {renderMenuItems(item.persistentSubMenu, session)}
        </SubMenu>
      );
    }

    const isDisabled =
      typeof item.disabled === 'function'
        ? item.disabled(session)
        : item.disabled;

    return (
      <MenuItem
        key={`${item.id}.${index}`}
        icon={<FlexxIcon icon={item.icon} width={20} height={20} />}
        href={item.href}
        disabled={isDisabled}
        component={Link}
      >
        {item.title}
      </MenuItem>
    );
  });
};

const FlexxMenuItemComponent: React.FC<FlexxMenuItem> = ({
  icon,
  title,
  href,
  subMenu,
  disabled,
  persistentSubMenu,
}) => {
  const session = useUserSession();

  const isDisabled = useMemo(() => {
    if (typeof disabled === 'function') {
      return disabled(session);
    }
    return disabled;
  }, [session, disabled]);

  if (persistentSubMenu) {
    return (
      <SubMenu
        persistent
        label={title}
        icon={<FlexxIcon icon={icon} width={20} height={20} />}
        {...(href
          ? {
              href: href,
              component: Link,
            }
          : {})}
        disabled={isDisabled}
      >
        {renderMenuItems(persistentSubMenu, session)}
      </SubMenu>
    );
  }

  if (subMenu) {
    return (
      <SubMenu
        label={title}
        icon={<FlexxIcon icon={icon} width={20} height={20} />}
        {...(href
          ? {
              href: href,
              component: Link,
            }
          : {})}
        disabled={isDisabled}
      >
        {renderMenuItems(subMenu, session)}
      </SubMenu>
    );
  }

  return (
    <MenuItem
      icon={<FlexxIcon icon={icon} width={20} height={20} />}
      component={Link}
      href={href}
      disabled={isDisabled}
      title={title}
    >
      {title}
    </MenuItem>
  );
};

export default React.memo(FlexxMenuItemComponent);
