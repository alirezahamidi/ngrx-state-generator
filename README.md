# ngrx-state-generator
A node app that allows you to generate general state files for ngrx

# Installation
~~~
$npm i ngrx-state-generator -g
~~~

you can use `npx generate-state` through cli to use generator.

Use help command to get syntax if you needed :
~~~
$npx generate-state --help
~~~

Generate All needed state files and codes to use in angular ngrx project.
~~~
$npx generate-state sample
~~~

If You didn't need to have a method like read you can add next parameter like this :
~~~
$npx generate-state sample cudf
~~~

the parameter will parse to methods like that :

c => create

r => read

u => update

d => delete

f => facade

with remove any of words from crudf you will remove the method

after you entered a full state , code will make a folder with given name + state and files to handel all functionality that will explain below : 

```
$npx generate-state sample
```
will be like that :

```
sample-state _
              |_index.ts
              |_sample-state.module.ts
              |_sample.actions.ts
              |_sample.effects.ts
              |_sample.entity.ts
              |_sample.facade.ts
              |_sample.reducer.ts
              |_sample.selectors.ts
              |_sample.service.ts
```

You can simply add folder to your ngrx folder and use it by importing simple-state.module.ts
Because of using exposer you can use 
~~~
import SampleStateModule from 'sample-state';
~~~