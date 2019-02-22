## Grammar

```ebnf
app  = func+
func = name,' ',name*,'=',exp
exp  = '(',exp,')'
     | call
     | atom
call = name,' ',arg*
arg  = '(',exp,')'
     | atom
     | name
atom = number
name = string
```

## Type

On top level, every type is a union of 1 or more primary types.

## Primary types

### Integer

Integers are the natural numbers and their negatives `{... −3, −2, −1, 0, 1, 2, 3, ...}`

Integer type can be limited with bounds as well as be represented as their union, e.g. a bound `(-∞, 3] ∪ [5, +∞)` means every integral number except for 4.

Bounds `[1, +∞)` and `[0, +∞)` have their own representations ℕ and ℕ0 respectively.

Integer type without any limits is shown as ℤ.
