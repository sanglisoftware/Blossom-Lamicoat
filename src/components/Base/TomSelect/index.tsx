import "@/assets/css/vendors/tom-select.css";
import clsx from "clsx";
import TomSelectPlugin from "tom-select";
import {
  Children,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  RecursivePartial,
  TomInput,
  TomSettings,
} from "tom-select/src/types/index";

export interface TomSelectElement
  extends HTMLSelectElement,
    Omit<TomInput, keyof HTMLSelectElement | "tomselect"> {
  TomSelect: TomSelectPlugin;
}

export interface TomSelectProps<T extends string | string[] = string | string[]>
  extends React.PropsWithChildren,
    Omit<React.ComponentPropsWithoutRef<"select">, "onChange"> {
  value: T;
  onOptionAdd?: (value: string) => void;
  onChange: (e: {
    target: {
      value: T;
    };
  }) => void;
  options?: RecursivePartial<TomSettings>;
  getRef?: (el: TomSelectElement) => void;
}

function TomSelect<T extends string | string[]>({
  className = "",
  options = {},
  value,
  onOptionAdd = () => {},
  onChange = () => {},
  getRef = () => {},
  children,
  ...computedProps
}: TomSelectProps<T>) {
  const selectRef = useRef<TomSelectElement | null>(null);
  const instanceRef = useRef<TomSelectPlugin | null>(null);

  const childrenSignature = useMemo(() => {
    return Children.toArray(children)
      .map((child) => {
        if (!isValidElement(child)) {
          return String(child ?? "");
        }

        return `${child.props.value ?? ""}:${Children.toArray(child.props.children).join("")}`;
      })
      .join("|");
  }, [children]);

  const computedOptions = useMemo(() => {
    let mergedOptions: RecursivePartial<TomSettings> = {
      ...options,
      plugins: {
        dropdown_input: {},
        ...options.plugins,
      },
    };

    if (Array.isArray(value)) {
      mergedOptions = {
        persist: false,
        create: true,
        onDelete(values: string[]) {
          return confirm(
            values.length > 1
              ? `Are you sure you want to remove these ${values.length} items?`
              : `Are you sure you want to remove "${values[0]}"?`
          );
        },
        ...mergedOptions,
        plugins: {
          remove_button: {
            title: "Remove this item",
          },
          ...mergedOptions.plugins,
        },
      };
    }

    return mergedOptions;
  }, [options, value]);

  useEffect(() => {
    const el = selectRef.current;
    if (!el) return;

    getRef(el);

    const instance = new TomSelectPlugin(el, {
      ...computedOptions,
      onOptionAdd: Array.isArray(value)
        ? (createdValue: string | number) => {
            onOptionAdd(String(createdValue));
          }
        : computedOptions.onOptionAdd,
    });

    instance.on("change", (selectedItems: string[] | string) => {
      onChange({
        target: {
          value: Array.isArray(selectedItems)
            ? ([...selectedItems] as T)
            : (selectedItems as T),
        },
      });
    });

    instanceRef.current = instance;

    if (Array.isArray(value)) {
      instance.setValue(value, true);
    } else {
      instance.setValue(value ?? "", true);
    }

    return () => {
      instance.off("change");
      instance.destroy();
      instanceRef.current = null;
    };
  }, [computedOptions, childrenSignature]);

  useEffect(() => {
    const instance = instanceRef.current;
    if (!instance) return;

    const currentValue = instance.getValue();
    const nextValue = Array.isArray(value) ? value : value ?? "";

    if (Array.isArray(nextValue)) {
      if (JSON.stringify(currentValue) !== JSON.stringify(nextValue)) {
        instance.setValue(nextValue, true);
      }
      return;
    }

    if (currentValue !== nextValue) {
      instance.setValue(nextValue, true);
    }
  }, [value]);

  return (
    <select
      {...computedProps}
      ref={(el) => {
        selectRef.current = el;
      }}
      value={value}
      onChange={(e) => {
        onChange({
          target: {
            value: e.target.value as T,
          },
        });
      }}
      className={clsx(["tom-select", className])}
    >
      {children}
    </select>
  );
}

export default TomSelect;
