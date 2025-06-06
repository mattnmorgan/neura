import { createRoot, Root } from "react-dom/client";
import React from "react";

/**
 * Generates a random number
 *
 * @param min Minimum (inclusive)
 * @param max Maximum (exclusive)
 * @returns Generated random number
 */
export function randomNumber(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min));
}

/**
 * Generates a string
 *
 * @param length Length of the string to generate
 * @param allowed Allowed characters regex (optional)
 * @returns String of the given length composed only of allowed characters
 */
export function generateString(length: number, allowed?: RegExp): string {
  let chars = [];

  while (chars.length != length) {
    const char = String.fromCharCode(randomNumber(0, 65537));

    if (!allowed || allowed.test(char)) {
      chars.push(char);
    }
  }

  return chars.join("");
}

/**
 * @param elementId Id of the container element to attach to
 * @param node Node to attach to the container
 * @returns The root element
 */
export function attachReact(elementId: string, node: React.ReactNode): Root {
  const container = document.getElementById(elementId);

  if (!container) {
    throw new Error(
      `Could not find container element with the id "${elementId}"`
    );
  }

  const root = createRoot(container);
  root.render(node);
  return root;
}
