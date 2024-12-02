# After School Course Selector Webservice

A MongoDB, Node.js, Express application for an eCommerce webservice to provide middleware communication between the deployed website and database.

<p>Class: CST3144</p>

<p>Name: Aman Mishra</p>

<p>MISIS: M00983641</p>

<p>Professor: Dr. Chinnu Mary George</p>

## Links for Submission

-   <p>GitHub Repo Frontend: https://github.com/MrRox1337/After-School-Course-Selector</p>
-   <p>GitHub Repo Backend: https://github.com/MrRox1337/After-School-Webservice</p>
-   <p>Deployed Frontend: https://mrrox1337.github.io/After-School-Course-Selector/</p>
-   <p>Deployed Backend Collection for Subjects: https://after-school-webservice.onrender.com/collection/subjects/</p>
-   <p>Deployed Backend Collection for Orders: https://after-school-webservice.onrender.com/collection/orders/</p>

## Database Collection Document Preview

-   Subject collection:

```
{
    "_id": "65186168151a6521b8321e",
    "subject": "Olympiad Practice",
    "location": "Block 19",
    "price": 125,
    "image": "static/subject1.jpg",
    "spaces": 5
}
```

-   Orders collection:

```
{
    "_id": "a6ec51r32dffadcca6e5d2",
    "order": {
        "fullName": "Aman Mishra",
        "phone": "971551528861"
    },
    "cart": [
        {
            "_id": "673050a197777b70b17e895e",
            "subject": "Olympiad Practice",
            "location": "Block 19",
            "price": 125,
            "image": "static/subject1.jpg",
            "spaces": 2
        }
    ]
}
```
