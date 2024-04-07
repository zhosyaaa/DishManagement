# Dish Management

The Dish Management API provides a set of endpoints for managing dishes in a restaurant. With this API, you can add, update, delete, and retrieve information about dishes. The API also supports functionality for managing translations for dish names and descriptions in multiple languages. This is a useful tool for automating menu management processes in a restaurant.


## Installation

1. Clone the repository to your local machine:

2. Install dependencies:

\`\`\`
npm install
\`\`\`

3. Start the application:

\`\`\`
nodemon app.js
\`\`\`

The application will be available at http://localhost:3000/.


## Technologies

- Node.js
- Express.js
- MongoDB
- EJS (Embedded JavaScript)
- Multer (for image upload)
- Axios (for HTTP requests)
- bcryptjs (for password hashing)
- express-session (for session management)


## Apis info

- https://spoonacular.com/food-api/docs 
 key:"fd74ec83259a440d9919d972c1e34a10"
- https://api-ninjas.com/api/nutrition key:"RylEwR0tvdoj1xbuI+2l9g==e99UWkaA9lxnXkCo"

## Admin Info
- username: Shakhnur
- email: Shakhnur@gmail.com
- password: Shakhnur

## Endpoints

- POST /change-language: This endpoint is used to change the interface language. Accepts the language parameter in the request body to specify the new language.
- GET /: Displays the registration page.
- GET /logout: Redirects the user to the home page (logs out).
- GET /login: Displays the login page.
- GET /all-dishes: Displays a list of all dishes. Requires user authentication.
- GET /dishes/:dish-id: Displays information about a specific dish by its identifier. Requires user authentication.
- GET /admin: Displays the administrator panel with a list of users. Requires user authentication and administrator rights.
- GET /admin/dish: Displays the page for adding a new dish. Requires user authentication and administrator rights.
- GET /index: Displays the main page with a limited list of dishes. Requires user authentication.
- GET /nutrition: Displays the page with information about nutrients. Requires user authentication.
- GET /recipes: Displays the page with dish recipes. Requires user authentication.
- POST /recipes: Retrieves dish recipes based on user's request. Requires user authentication.
- POST /nutrition: Retrieves information about nutrients based on user's request. Requires user authentication.
- POST /admin/dish: Adds a new dish. Requires user authentication and administrator rights.
- POST /register: Registers a new user.
- POST /login: Logs in an existing user.
- POST /admin/add: Adds a new user by an administrator. Requires user authentication and administrator rights.
- POST /admin/update: Updates user information. Requires user authentication and administrator rights.
- POST /admin/delete: Deletes a user. Requires user authentication and administrator rights.
- POST /admin/dish/update: Updates dish information. Requires user authentication and administrator rights.
- POST /admin/dish/delete: Deletes a dish. Requires user authentication and administrator rights.






