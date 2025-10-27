## v13.8
- Inline editing of skills from the character sheet should be working again in Development/Creation phase.

## v13.7
- Additional CCI option, Ambient Light toggle added
- All CCI show/hide options have become show/hide/toggle

## V13.6
- Chaosium Canvas Interface update

## V13.5
- Chaosium Canvas Interface support added with some extra (brief) game instructions

## V13.4
- Spell Mastery will now work (bug fix) - if you updated the name or spell level you couldn't master the spell
- Spell pre-requisites now visible and can be ammended/set

V13.3
- You can now edit actor images in the usual way.

V13.2
-  There is a new game setting "Use Large Font" - all actor and item sheets will use a larger (18px) font to make it easier to read.  This is specific to the user, it does not apply automatically to all users.

V13.1
-  Move to Foundry V13 - PLEASE PLEASE PLEASE back up your world
-  Actors and Items have been migrated to Application V2 - these may mean there are some slight layout changes
-  Context menus have been moved to icons - you'll now see magnifying glass icons to view/edit an item or a traschcan (double click) to delete an item
-  Some dialogs have been moved to V2 dialog, some others are still V1 and will be addressed in due course.

V12.15
- Change to manifest URL to correct it

V12.14
- Added a system option to turn off the "No Target" warning message.

V12.13a
- Updated to make min version of Foundry = 12

V12.13
- Updated for Foundry V12.325
- Removed dependency of socketlib
- Added language localization for Create Items and Actors
- Added rich text editors to "description" sections in actors and items
- Corrected location of description data in item and added a migration script.  PLEASE BACKUP YOUR WORLD BEFORE RUNNING THE MIGRATION SCRIPT FROM THE GM Tools

V11.11
-Fixed a bug with dropping items on character sheet
-Checked system runs under Foundry V11.308

V11.10
-No changes made, just checked compatability to Foundry V11.306

V11.9
-Minor tweak on Difficulty Dialog to change text colour

V11.8
- Character and NPC sheets will now be coloured green for Demi Monde.  Everything else remains blue.
- Moved hp.max and armour.natural for permanent stats to derived stats to remove an _id error on creating actor

V11.7
- checked for compatability with Foundry V11
- added check to stop duplicate skills, spells or advantages being added to the character sheet

V10.6
-The three instructions documents moved to a Journal compendium to make them visible in game
-Checks rolls code refactored to enable item macros
-Item macro functionality added - drag item to the hotbar - you can trigger rolls from there for spells, skills, or weapons (otherwise display the equipment sheet)  
-Tweak to natural armour to remove the armour points if the advantage is removed
-Bonus/Penalty dice selector on difficulty rolls is now -1 to +1, unless it's for attacks (weapons or spells) in which case it remains at -2 to +2.  The underlying 
functionality hasn't changed (max one bonus/penalty dice, but with the extra one carried over to damage rolls) - it is just a cosmetic change
-Actor and Item sheets redesigned to incorporate a bit more colour, make the font a bit larger and to fix some bugs
-Context menus added to spells, skills etc - at this stage just edit and delete (icons removed in the sheet redesign) - more functionality may follow

V10.5
Changed Luck Reset roll check to allow a roll where Luck = zero to account for newly created characters
Added compendium with common and fighting skills plus examples of other items
Added tooltips to weapon sheet damage types
Added three instructions documents covering setting up a world, creating a character, and doing stuff in game.

V10.4
Changed Character & NPC Types to toggles which then update charType (Character = Investigator/Demi Monde, NPS is NPC/Demi Monde/Creature)
Concealment question for damage only shown if damage type is not Magic or Vorpal0
Fixed issue with potential damage (issue with correctly getting damageBonus)
Fixed issue with targeting not being called where base damage was zero for weapons
Removed actor from message - to reduce  message size

V10.3 skipped to align numbering with system.json file

V10.2
Changed template.json - added defaults for a number of options on items
Added portrait to NPC sheet
Added some tooltips on Damage Types to explain their effects

