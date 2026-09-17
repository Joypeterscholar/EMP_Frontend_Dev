# Issues

## 2d view broken
- The problem here is centering the `sunAngleCamera` to the model itself

## separate tagging and viewing models page
- A nicer UX will allow users either tag or view tags in one place
- The code of both pages `src/pages/TagModel.jsx` and `src/pages/SingleModel` are'nt too far apart, we could figure out a way to bring both in one page by making the differing parts into separate components to be children of the main viewing page


## Close forms after operation complete e.g tag creation form etc
- current forms stay opened after submision, perhaps closing them will make a better ux and prevent duplicate entries e.g dup tag


## Create tag form very bad ux
- The previous implementation in `src/pages/TagModel.jsx` file used material-ui, somehow but weirdly the tag type selection options after first opening will refuse to open till after some couple seconds
- So currentlyi i made it to use native browser select
- you can test this weird behaviour by uncommenting the code and you are welcome to find a fix so we can have a consistent UI




## UI Enhancement: Login and User Profile Pages
- Implemented modern UI using Shadcn components for better user experience
- Redesigned login page with improved form layout and validation
- Enhanced edit profile page with:
  - Better form organization
  - Improved input fields styling
  - Modern file upload interface
  - Responsive layout adjustments
  - Enhanced select dropdowns
- Added loading states and animations
- Improved error handling visual feedback
- Maintained consistent color scheme
- Enhanced mobile responsiveness
- Added proper form validation feedback



## UI Enhancement: Dashboard Redesign
- Migrated from Material-UI to Shadcn components for better consistency
- Enhanced Dashboard cards with:
  - Expandable functionality with smooth animations
  - Visual indicators for expandable content
  - Rotating chevron icons
  - Hover effects with gradient overlays
  - Scale transitions on hover and expansion
  - Fade effects for collapsed content
  - Improved responsive layout
  - Better color scheme consistency
  - Animated borders and shadows
- Technical improvements:
  - Added reusable ExpandableCard component
  - Implemented smooth transitions using CSS
  - Better state management for card expansion
  - Improved accessibility with visual feedback
  - Maintained all existing functionality while enhancing UX



  ## UI Enhancement: Menu Component Redesign
- Improved vertical alignment and spacing of menu elements
- Fixed logo sizing and positioning issues
- Enhanced menu structure with:
  - Better separation between logo, navigation links, and logout section
  - Consistent padding and spacing
  - Improved mobile responsiveness
  - Better visual hierarchy
- Technical improvements:
  - Replaced Material-UI Button with Shadcn Button for consistency
  - Better CSS organization using Tailwind classes
  - Improved responsive behavior
  - Better semantic HTML structure
  - Enhanced accessibility




1. **ModelCard Component Enhancements**
   - Improved dropdown menu styling and functionality
   - Added consistent white background to dropdowns
   - Added pointer cursor to dropdown items
   - Enhanced z-index for better menu visibility
   - Improved overall component styling and transitions

2. **AllModels Layout Optimization**
   - Restructured grid layout for better model display
   - Implemented flex-wrap for responsive design
   - Set up proper spacing between model cards
   - Optimized for 3 models per row display
   - Added minimum width constraints for better responsiveness

3. **Login Page Redesign**
   - Removed left sided cover image in the login page

### Technical Details
- Updated dropdown menu implementation using Shadcn components
- Implemented proper styling for hover states and transitions
- Enhanced responsive design for various screen sizes
- Improved visual hierarchy and user experience
- Added proper documentation and code organization




## Feature requests / change
## Future bugs to come




