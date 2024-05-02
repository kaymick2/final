# Lit Reviews

## To start website

```terminal
.\venv\scripts\activate
npm i -g react-scripts
npm install --save react react-dom @types/react @types/react-dom
pip install -r requirements.txt
npm start
```

Which will open the website then, in a new terminal:

```terminal
.\venv\scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Finally reload the website.

## Description

Lit Reviews created by Astra, Arjo, and Kyle. This product is designed to be used in academic settings in order to:

- Improve Student Engagement: Encourage students to critically evaluate books and share their insights with classmates.
- Enhanced Learning Environment: Organize reviews and provide a valuable resource for students to discover new books and deepen their understanding of literature.
- Streamlined Review Management: Teachers can efficiently track student progress, provide feedback on reviews, and foster a culture of active learning.

## Features included within

- User registration: including Student and Teacher roles
  - Students: Create reviews and view other students' reviews.
  - Teachers: Post books for discussion and edit reviews to keep them school friendly.
- Image upload and download to facilitate book discussion
