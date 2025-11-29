import React from 'react';

// Minimal polymorphic component used by the dev sandbox and app pages.
// Prevent forwarding internal props (like `renderId`) to DOM elements to
// avoid React warnings about unknown DOM attributes.
export default function CreatePolymorphicComponent({ as: Component = 'div', children, ...props }) {
  // Remove internal-only props that should not be rendered on DOM nodes
  const { renderId, as, ...rest } = props;

  // If Component is a string (intrinsic DOM element), avoid passing unknown
  // props. Otherwise, pass through for custom components.
  if (typeof Component === 'string') {
    return React.createElement(Component, rest, children);
  }

  return <Component {...rest}>{children}</Component>;
}
