/**
 * @author Bob's Garage Team
 * @purpose Sprinkles utility classes for design system
 * @version 1.0.0
 */

import { createSprinkles, defineProperties } from '@vanilla-extract/sprinkles';
import { tokens } from './tokens.css';

const spaceProperties = defineProperties({
  properties: {
    padding: tokens.space,
    paddingTop: tokens.space,
    paddingBottom: tokens.space,
    paddingLeft: tokens.space,
    paddingRight: tokens.space,
    margin: tokens.space,
    marginTop: tokens.space,
    marginBottom: tokens.space,
    marginLeft: tokens.space,
    marginRight: tokens.space,
    gap: tokens.space,
    rowGap: tokens.space,
    columnGap: tokens.space,
  },
});

const colorProperties = defineProperties({
  properties: {
    color: tokens.colors,
    backgroundColor: tokens.colors,
    borderColor: tokens.colors,
  },
});

const layoutProperties = defineProperties({
  properties: {
    display: ['none', 'block', 'flex', 'inline-flex', 'grid', 'inline-block'],
    flexDirection: ['row', 'column', 'row-reverse', 'column-reverse'],
    alignItems: ['flex-start', 'center', 'flex-end', 'stretch'],
    justifyContent: [
      'flex-start',
      'center',
      'flex-end',
      'space-between',
      'space-around',
      'space-evenly',
    ],
    width: ['100%', 'auto'],
    height: ['100%', 'auto'],
    overflow: ['hidden', 'visible', 'auto', 'scroll'],
  },
});

const borderProperties = defineProperties({
  properties: {
    borderRadius: tokens.radius,
    borderWidth: ['0', '1px', '2px', '4px'],
    borderStyle: ['solid', 'dashed', 'dotted', 'none'],
  },
});

const typographyProperties = defineProperties({
  properties: {
    fontSize: tokens.fontSizes,
    fontWeight: tokens.fontWeights,
    textAlign: ['left', 'center', 'right', 'justify'],
    textDecoration: ['none', 'underline'],
  },
});

const shadowProperties = defineProperties({
  properties: {
    boxShadow: tokens.shadows,
  },
});

export const sprinkles = createSprinkles(
  spaceProperties,
  colorProperties,
  layoutProperties,
  borderProperties,
  typographyProperties,
  shadowProperties
);

export type Sprinkles = Parameters<typeof sprinkles>[0];

// Responsive breakpoint versions
export const responsiveSprinkles = createSprinkles(
  spaceProperties,
  colorProperties,
  layoutProperties,
  borderProperties,
  typographyProperties,
  shadowProperties
);

export default sprinkles;
