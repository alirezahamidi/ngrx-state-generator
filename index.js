const fs = require('fs');
function run() {
  const input = process.argv[2];
  let params = process.argv[3];

  if (!params || params == '') params = 'crudf';
  else params = params.toLowerCase();

  const create = params.indexOf('c') >= 0;
  const read = params.indexOf('r') >= 0;
  const update = params.indexOf('u') >= 0;
  const delet = params.indexOf('d') >= 0;
  const facade = params.indexOf('f') >= 0;
  const filePath = `${input}-state`;

  if (!input || input == '') {
    console.log("Add --help to see help");
    return;
  }
  if (input == "--help") {
    console.log(`
        NGRX State Files Generator : 
        Commands :

        node index your-file-name:
        Basic command will make you basic Read State.

        parameters:

        crudf
        use it when you want to customize state:

        c => create
        r => read
        u => update
        d => delete
        f => facade

        sample crf => Create Read and Facade
    `);
    return;
  }

  let isExist = fs.existsSync(filePath);
  if (!isExist) fs.mkdirSync(filePath);

  let upperCaseName = input.split('-').map((x) => {
    let a = "";
    for (let i = 0; i < x.length; i++) {
      if (i == 0)
        a += x[i].toUpperCase();
      else
        a += x[i].toLowerCase();
    }
    return a;
  }).join('');

  let lowerCaseName = input.split('-').map((x, j) => {
    let a = "";
    for (let i = 0; i < x.length; i++) {
      if (i == 0 && j != 0)
        a += x[i].toUpperCase();
      else
        a += x[i].toLowerCase();
    }
    return a;
  }).join('');

  let featureKey = input.split('-').map((x) => x.toUpperCase()).join('_') + "_FEATURE_KEY";


  let actions = `import { createAction, props } from "@ngrx/store";

export class ${upperCaseName}Actions {
    ${create ? `static addNew${upperCaseName} = createAction('[${upperCaseName}] Add New ${upperCaseName}', props<{ data: any }>());

    static ${lowerCaseName}Added = createAction('[${upperCaseName}] New ${upperCaseName} Added', props<{ data: any }>());
    ` : ''}
    ${read ? `static loadAll = createAction('[${upperCaseName}] Load All Data');

    static loaded = createAction('[${upperCaseName}] All Data Loaded', props<{ data: any }>());
    ` : ''}
    ${update ? `static update${upperCaseName} = createAction('[${upperCaseName}] Update ${upperCaseName}', props<{ data: any , id: any}>());

    static ${lowerCaseName}Updated = createAction('[${upperCaseName}] ${upperCaseName} Updated', props<{ data: any }>());
    ` : ''}
    ${delet ? `static delete${upperCaseName} = createAction('[${upperCaseName}] Delete ${upperCaseName}', props<{ id: any}>());

    static ${lowerCaseName}Deleted = createAction('[${upperCaseName}] ${upperCaseName} Deleted', props<{ data: any }>());
    ` : ''}
    static error = createAction('[${upperCaseName}] Error Occurred', props<{ reason: any }>());
}
`;

  fs.writeFileSync(`./${filePath}/${input}.actions.ts`, actions);
  console.log('Actions File Created!');


  let entity = `import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';

export const ${featureKey} = "${lowerCaseName}";

export interface ${lowerCaseName}State extends EntityState<any>{
    loaded: boolean;
    message: any;
    statistics: any[];
    error: any;
    submitted: boolean;
}


export const ${lowerCaseName}Adapter : EntityAdapter<any> = createEntityAdapter<any>();

export const initialState:  ${lowerCaseName}State = ${lowerCaseName}Adapter.getInitialState({
    loaded: null,
    message: null,
    statistics: null,
    error: null,
    submitted: false
});

export interface ${lowerCaseName}PartialState {
    [${featureKey}]: "${lowerCaseName}"
}`;

  fs.writeFileSync(`./${filePath}/${input}.entity.ts`, entity);
  console.log('Entity File Created!');

  let effects = `import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ${upperCaseName}Actions } from './${input}.actions';
import { ${upperCaseName}Service } from './${input}.service';

@Injectable()
export class ${upperCaseName}Effect {

    ${read ? `loadAll$ = createEffect(() =>
    this.action$.pipe(
      ofType(${upperCaseName}Actions.loadAll),
      mergeMap((action) =>
        this.service.loadAll().pipe(
          map((data) => {
            return ${upperCaseName}Actions.loaded({ data: data });
          }),
          catchError((error) => of(${upperCaseName}Actions.error({ reason: error })))
        )
      )
    ));
    `: ''}
    ${create ? `addNew$ = createEffect(() =>
    this.action$.pipe(
      ofType(${upperCaseName}Actions.addNew${upperCaseName}),
      mergeMap((action) =>
        this.service.addNew(action.data).pipe(
          map((data) => {
            return ${upperCaseName}Actions.${lowerCaseName}Added({ data: data });
          }),
          catchError((error) => of(${upperCaseName}Actions.error({ reason: error })))
        )
      )
    ));
    `: ''}
    ${update ? `update$ = createEffect(() =>
    this.action$.pipe(
      ofType(${upperCaseName}Actions.update${upperCaseName}),
      mergeMap((action) =>
        this.service.update(action.data,action.id).pipe(
          map((data) => {
            return ${upperCaseName}Actions.${lowerCaseName}Updated({ data: data });
          }),
          catchError((error) => of(${upperCaseName}Actions.error({ reason: error })))
        )
      )
    ));
    `: ''}
    ${delet ? `delete$ = createEffect(() =>
    this.action$.pipe(
      ofType(${upperCaseName}Actions.delete${upperCaseName}),
      mergeMap((action) =>
        this.service.delete(action.id).pipe(
          map((data) => {
            return ${upperCaseName}Actions.${lowerCaseName}Deleted({ data: data });
          }),
          catchError((error) => of(${upperCaseName}Actions.error({ reason: error })))
        )
      )
    ));`: ''}

    constructor(
        private action$: Actions,
        private service: ${upperCaseName}Service
      ) { }

}
`;

  fs.writeFileSync(`./${filePath}/${input}.effects.ts`, effects);
  console.log('Effects File Created!');

  let reducer = `import { Action, createReducer, on } from '@ngrx/store';
import { ${upperCaseName}Actions } from './${input}.actions';
import { ${lowerCaseName}Adapter, initialState, ${lowerCaseName}State, ${lowerCaseName}PartialState } from './${input}.entity';

export class ${upperCaseName}Reducer {
    static _reducer = createReducer(initialState,
        ${read ? `on(${upperCaseName}Actions.loadAll, (state) => ({
            ...state,
            loaded: false,
            message: null,
            statistics: null,
            error: null,
            submitted: false
        })),
        on(${upperCaseName}Actions.loaded, (state, { data }) =>
            ${lowerCaseName}Adapter.setAll(data,{
            ...state,
            message: null,
            loaded: true,
            statistics: null,
            error: null,
            submitted: false
        })),
        `: ''}${create ? `on(${upperCaseName}Actions.addNew${upperCaseName}, (state) => ({
            ...state,
            loaded: false,
            message: null,
            statistics: null,
            error: null,
            submitted: false
        })),
        on(${upperCaseName}Actions.${lowerCaseName}Added, (state) => ({
            ...state,
            message: null,
            loaded: true,
            statistics: null,
            error: null,
            submitted: false
        })),`: ''}${update ? `on(${upperCaseName}Actions.update${upperCaseName}, (state) => ({
            ...state,
            loaded: false,
            message: null,
            statistics: null,
            error: null,
            submitted: false
        })),
        on(${upperCaseName}Actions.${lowerCaseName}Updated, (state) => ({
            ...state,
            message: null,
            loaded: true,
            statistics: null,
            error: null,
            submitted: true
        })),`: ''}${delet ? `on(${upperCaseName}Actions.delete${upperCaseName}, (state) => ({
            ...state,
            loaded: false,
            message: null,
            statistics: null,
            error: null,
            submitted: false
        })),
        on(${upperCaseName}Actions.${lowerCaseName}Deleted, (state) => ({
            ...state,
            message: null,
            loaded: true,
            statistics: null,
            error: null,
            submitted: true
        })),`: ''}
        on(${upperCaseName}Actions.error, (state, { reason }) => ({
          ...state,
          error: reason,
          loaded: true
        })),
    );

    static reducer(state: ${lowerCaseName}State, action: Action) {
        return ${upperCaseName}Reducer._reducer(state, action);
    }
}
`;

  fs.writeFileSync(`./${filePath}/${input}.reducer.ts`, reducer);
  console.log('Reducer File Created!');

  let selectors = `import { createFeatureSelector, createSelector } from "@ngrx/store";
import { ${featureKey}, ${lowerCaseName}State, ${lowerCaseName}Adapter } from "./${input}.entity";
const { selectAll } = ${lowerCaseName}Adapter.getSelectors();

export class ${upperCaseName}Selectors {
    static featureSelector = createFeatureSelector<${lowerCaseName}State>(${featureKey});

    static data = createSelector(${upperCaseName}Selectors.featureSelector, (state) => selectAll(state));

    static loaded = createSelector(${upperCaseName}Selectors.featureSelector, (state) => state.loaded);

    static message = createSelector(${upperCaseName}Selectors.featureSelector, (state) => state.message);

    static statistics = createSelector(${upperCaseName}Selectors.featureSelector, (state) => state.statistics);

    static error = createSelector(${upperCaseName}Selectors.featureSelector, (state) => state.error);

    static submitted = createSelector(${upperCaseName}Selectors.featureSelector, (state) => state.submitted);
}`;

  fs.writeFileSync(`./${filePath}/${input}.selectors.ts`, selectors);
  console.log('Selectors File Created!');

  let service = `import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { HttpClient } from "@angular/common/http";

import { ${featureKey} } from "./${input}.entity";
@Injectable()
export class ${upperCaseName}Service {

  constructor(
    private http: HttpClient
  ) {  }

  loadAll(): Observable<any[]> {
    return this.http.get<any[]>(
      environment.baseApiUrl
    );
  }

  addNew(data:any): Observable<any> {
    return this.http.post<any>(
      environment.baseApiUrl + 'postPath',
      data
    );
  }

  update(data, id: number): Observable<any> {
    return this.http.post<any>(
      environment.baseApiUrl + ${'`postPath/${id}/update`'},
      data
    );
  }

  delete(id):Observable<any>{
    return this.http.post<any>(
        environment.baseApiUrl + ${'`postPath/${id}/delete`'},{});
  }
}
`;

  fs.writeFileSync(`./${filePath}/${input}.service.ts`, service);
  console.log('Service File Created!');

  if (facade) {
    let facade = `import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { ${upperCaseName}Actions } from './${input}.actions';
import { ${lowerCaseName}PartialState , ${featureKey} } from './${input}.entity';
import { ${upperCaseName}Selectors } from './${input}.selectors';

@Injectable()
export class ${upperCaseName}Facade {
    ${lowerCaseName}$ = this.store.pipe(select(${upperCaseName}Selectors.data));

    loaded$ = this.store.pipe(select(${upperCaseName}Selectors.loaded));

    message$ = this.store.pipe(select(${upperCaseName}Selectors.message));

    statistics$ = this.store.pipe(select(${upperCaseName}Selectors.statistics));

    error$ = this.store.pipe(select(${upperCaseName}Selectors.error));

    submitted$ = this.store.pipe(select(${upperCaseName}Selectors.submitted));

    name = ${featureKey};

    constructor(
        private store: Store<${lowerCaseName}PartialState>
    ) {
        this.loadAll();
    }

    ${read ? `loadAll() {
        this.store.dispatch(${upperCaseName}Actions.loadAll());
    }
    `: ''}
    ${update ? `update(id:any,data:any) {
        this.store.dispatch(${upperCaseName}Actions.update${upperCaseName}({id,data}));
    }
    `: ''}
    ${create ? `addNew(data:any) {
        this.store.dispatch(${upperCaseName}Actions.addNew${upperCaseName}({data}));
    }
    `: ''}
    ${delet ? `delete(id:any) {
        this.store.dispatch(${upperCaseName}Actions.delete${upperCaseName}({id}));
    }
    `: ''}
}
    `

    fs.writeFileSync(`./${filePath}/${input}.facade.ts`, facade);
    console.log('Facade File Created!');

    let module = `import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { ${upperCaseName}Effect } from './${input}.effects';
import { ${featureKey} } from './${input}.entity';
import { ${upperCaseName}Service } from './${input}.service';
import { ${upperCaseName}Facade } from './${input}.facade';
import { ${upperCaseName}Reducer } from './${input}.reducer';
import { CommonModule } from "@angular/common";

@NgModule({
    imports: [
    StoreModule.forFeature(
        ${featureKey},
        ${upperCaseName}Reducer.reducer
    ),
    EffectsModule.forFeature([${upperCaseName}Effect]),
    CommonModule
    ],
    providers: [${upperCaseName}Facade, ${upperCaseName}Service]
})
export class ${upperCaseName}StateModule {}`;

    fs.writeFileSync(`./${filePath}/${input}-state.module.ts`, module);
    console.log('Module File Created!');


    let index = `export { ${upperCaseName}Facade } from './${input}.facade';
export { ${upperCaseName}StateModule } from './${input}-state.module';
export { ${upperCaseName}Service } from './${input}.service';
`

    fs.writeFileSync(`./${filePath}/index.ts`, index);
    console.log('Index File Created!');
  }
}

run();