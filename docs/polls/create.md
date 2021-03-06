# Create a new poll

**HTTP Request**

`POST /events/{code}/polls`

**Parameters**

| Name   | Type   | In   | Description                          |
| :----- | :----- | :--- | :----------------------------------- |
| `code` | string | path | **Required**. The code of the event. |
| `title` | string | body | **Required**. The title of the poll. |
| `type` | string | body | Either `bar` for a bar chart or `word` for a word cloud. Default `bar`. |
| `duration` | number | body | The duration of the poll in seconds. Default `180`. |
| `votesPerParticipant` | number | body | The amount of votes each participants has. Default `1`. |
| `allowMultipleVotesPerAnswer` | boolean | body | If set to `true` and `votesPerParticipant` is greater than `1`, participants can use their votes multiple times for the same answer. Default `false`. |
| `allowCustomAnswers` | boolean | body | Set to `true` if participants can add customs answers to the poll. Default `false`. |

**Success response**

```
Status: 200 OK
```

```json
{
    "_id": "61c2ffd9b98abd8124e93bdf"
}
```

**Missing title**

```
Status: 400 Bad Request
```
