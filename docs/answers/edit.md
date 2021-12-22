# Edit an answer

**HTTP Request**

`PUT /answers/{answer_id}`

| Name   | Type   | In   | Description                          |
| :----- | :----- | :--- | :----------------------------------- |
| `answer_id` | string | path | **Required**. The answer id. |
| `title` | string | body | The title of the answer. |
| `hidden` | boolean | body | Indicates if the answer is visible to participants. |

**Success response**

```
Status: 200 OK
```

```json
{
    "_id": "61c2ffd9b98abd8124e93bdf"
}
```

**Answer not found**

```
Status: 404 Not Found
```

**Duplicate answer**

An answer with this title already exists for this vote.

```
Status: 409 Conflict
```

**Permission denied**

Only organizers can edit answers.

```
Status: 403 Forbidden
```