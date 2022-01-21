import { useTransition, animated } from "react-spring";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faTrashAlt,
  IconDefinition,
  faSlidersV,
} from "@fortawesome/pro-regular-svg-icons";
import { faBadgeCheck } from "@fortawesome/pro-solid-svg-icons";
import { ForwardedRef, forwardRef, MouseEventHandler, ReactNode } from "react";
import {
  Column as ColumnType,
  ColumnItem,
  useColumnStore,
  useUserPanelStore,
} from "src/stores";
import classNames from "classnames";

interface ColumnProps extends ColumnType {
  ref: any;
  items: ColumnItem[];
  hasPanel: boolean;
}

function Badge({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`flex items-center text-sm font-medium h-5 px-1 ${className}`}
    >
      {children}
    </span>
  );
}

function HeaderButton({
  icon,
  onClick,
  isActive,
}: {
  icon: IconDefinition;
  onClick: MouseEventHandler;
  isActive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${
        isActive
          ? "ring-2 ring-gray-900 bg-white"
          : "bg-gray-300 hover:bg-gray-900 hover:text-white"
      } text-gray-900 text-xl rounded-full w-10 h-10 transition-all `}
    >
      <FontAwesomeIcon icon={icon} />
    </button>
  );
}
export const Column = forwardRef(
  (
    { id, name, items, hasPanel }: ColumnProps,
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    const removeColumn = useColumnStore((state) => state.remove);
    const setIsVisibleByColumnId = useUserPanelStore(
      (state) => state.setIsVisibleByColumnId
    );
    const removeUserPanelByColumnId = useUserPanelStore(
      (state) => state.removeByColumnId
    );
    let height = 0;
    const paddingHeight = 2;
    const itemHeight = 28;
    // example from: https://codesandbox.io/s/github/pmndrs/react-spring/tree/master/demo/src/sandboxes/list-reordering?file=/src/App.tsx
    const transitions = useTransition(
      items
        .filter((item) => item.isVisible)
        .map((item, index) => ({
          ...item,
          height: itemHeight,
          y: (height += itemHeight + paddingHeight) - itemHeight,
        })),
      {
        key: (item: any) => item.id,
        from: { height: 0, opacity: 0 },
        leave: { height: 0, opacity: 0 },
        enter: ({ y, height }) => ({ y, height, opacity: 1 }),
        update: ({ y, height }) => ({ y, height }),
      }
    );

    return (
      <div className="w-full max-w-sm mx-2 -mt-20" ref={ref}>
        {/* head */}
        <div className="relative h-20 flex items-center justify-center">
          <h2 className="text-3xl font-bold">{name}</h2>
          <div className="flex items-center space-x-2 absolute right-0">
            <HeaderButton
              icon={faTrashAlt}
              onClick={() => {
                removeColumn(id);
                removeUserPanelByColumnId(id);
              }}
            />
            <HeaderButton
              icon={faSlidersV}
              onClick={() => setIsVisibleByColumnId(id, !hasPanel)}
              isActive={hasPanel}
            />
          </div>
        </div>
        {/* items */}
        <div
          className="relative h-full"
          style={{ height, top: `-${paddingHeight}px` }}
        >
          {transitions(
            (
              style,
              {
                id: itemId,
                category,
                hasAd,
                age,
                baseRank,
                isVisible,
                hasPublicSource,
              },
              t,
              index
            ) => (
              <animated.div
                className={classNames(
                  `${category?.bgColor} absolute w-full flex items-center justify-between h-7 mb-0.5 px-1.5 text-white hover:bg-opacity-80`
                )}
                style={{
                  willChange: "transform, height, opacity",
                  zIndex: items.length - index,
                  ...style,
                }}
              >
                <div className="flex items-center relative">
                  <div className="absolute -left-14 w-10 text-right text-sm text-white">
                    {index + 1}
                  </div>
                  <div className="w-14">#{itemId}</div>
                  <div className="w-9">
                    {category && <FontAwesomeIcon icon={category.icon} />}
                  </div>
                  <div className="w-8">
                    {hasPublicSource && <FontAwesomeIcon icon={faBadgeCheck} />}
                  </div>
                  {/* <div className="">
                    {age === ageTypes["today"].value && (
                      <Badge className="bg-blue-500">NEU</Badge>
                    )}
                  </div> */}
                  {hasAd && <Badge className="bg-red-500">AD</Badge>}
                </div>
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faHeart} />
                  <span className="ml-0.5 text-sm">
                    {Math.round((1 - baseRank) * 100)}%
                  </span>
                </div>
              </animated.div>
            )
          )}
        </div>
      </div>
    );
  }
);
