Grammar v0.0:

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
