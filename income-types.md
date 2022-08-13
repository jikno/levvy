# Income Types

First of all, what is an income type?

And income type is a template used for splitting up income transactions into envelopes.

To create a new income type, insert a new `IncomeType` to the `incomeTypes` array.

This array can be accessed by clicking the `</>` icon in the bottom right corner of the application.

## IncomeType

And income type has an id and a name for quick access, and an array of operations.

Each operation takes some money off of the amount that the income type is being applied to. Here is an example:

If I created an income type that looked like this...

```json
{
	"id": "...",
	"name": "Paycheck",
	"operations": [
		{
			"operation": "variable-take",
			"envelopeId": "<tithe>",
			"percentage": 10
		},
		{
			"operation": "fixed-take",
			"envelopeId": "<bills>",
			"amount": 100
		},
		{
			"operation": "variable-take",
			"envelopeId": "<gas>",
			"percentage": 5,
			"min": 50,
			"max": 200
		},
		{
			"operation": "split",
			"envelopePercentages": {
				"<spending>": 10,
				"<defenses>": 3,
				"<boat savings>": 7,
				"<groceries>": 50,
				"<mortgage>": 20,
				"<home improvement>": 10
			}
		}
	]
}
```

> NOTE: Of course, replace the envelope names in brackets with the id's of those envelopes

... this is how it would be resolved if it was applied to 1000 dollars:

- First, 10% would be put into the tithe envelope ($100)
- Then, $100 would be put into the bills envelope
- Then, 5% of what is left would be put into the gas envelope ($40). Because, however, there is a minimum set on this operation, $50 will be added to the envelope.
- Then, the remaining money would be split up into the envelopes as such:
  - 10% into spending ($75)
  - 3% into defense ($22.50)
  - 7% into boat savings ($52.50)
  - 50% into groceries ($375)
  - 20% into mortgage ($150)
  - 10% into home improvement ($75)
