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

There are three main types:

1. `any` represents that value of any type is allowed. Generally, this is unused arguments.
2. `never` means there is no values which can fit this type. This is an error.
3. And a union of 1 or more basic types. Values belong to any of its types.

### Basic types

#### Integer

Integers are the natural numbers and their negatives `{... −3, −2, −1, 0, 1, 2, 3, ...}`

Integer type can be limited with bounds as well as be represented as their union, e.g. a bound `(-∞, 3] ∪ [5, +∞)` means every integral number except for 4.

Bounds `[1, +∞)` and `[0, +∞)` have their own representations ℕ and ℕ0 respectively.

Integer type without any limits is shown as ℤ.
