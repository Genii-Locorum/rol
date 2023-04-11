/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
 export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([

    // Actor and Item partials.
    "systems/rol/templates/actor/parts/actor-skills.html",
    "systems/rol/templates/actor/parts/actor-equipment.html",
    "systems/rol/templates/actor/parts/actor-magic.html",
    "systems/rol/templates/actor/parts/actor-traits.html",
    "systems/rol/templates/actor/parts/actor-biography.html",
    "systems/rol/templates/actor/parts/actor-development.html",
    "systems/rol/templates/item/item-prereq.html",
  ]);
};
