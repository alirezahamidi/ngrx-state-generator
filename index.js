#!/usr/bin/env node
const io = require("./io");
const fs = require("fs");
function run() {
  params = io.getParams();

  if (io.handleInput() < 0) return;
  io.initFile();

  let upperCaseName = io.startUpperCaseName();
  let lowerCaseName = io.startLowerCaseName();
  let featureKey = io.featureKey();

  let model = `export default interface ${upperCaseName}Model {
    id:number;
    name:string;
  }`;

  io.createFile(model, "model");

  let actions = `import { createAction, props } from "@ngrx/store";

export class ${upperCaseName}Actions {
    ${
      params.create
        ? `static addNew${upperCaseName} = createAction('[${upperCaseName}] Add New ${upperCaseName}', props<{ data: any }>());

    static ${lowerCaseName}Added = createAction('[${upperCaseName}] New ${upperCaseName} Added', props<{ data: any }>());
    `
        : ""
    }
    ${
      params.read
        ? `static loadAll = createAction('[${upperCaseName}] Load All Data');

    static loaded = createAction('[${upperCaseName}] All Data Loaded', props<{ data: any }>());
    `
        : ""
    }
    ${
      params.update
        ? `static update${upperCaseName} = createAction('[${upperCaseName}] Update ${upperCaseName}', props<{ data: any , id: any}>());

    static ${lowerCaseName}Updated = createAction('[${upperCaseName}] ${upperCaseName} Updated', props<{ data: any }>());
    `
        : ""
    }
    ${
      params.delete
        ? `static delete${upperCaseName} = createAction('[${upperCaseName}] Delete ${upperCaseName}', props<{ id: any}>());

    static ${lowerCaseName}Deleted = createAction('[${upperCaseName}] ${upperCaseName} Deleted', props<{ data: any }>());
    `
        : ""
    }
    static error = createAction('[${upperCaseName}] Error Occurred', props<{ reason: any }>());
}
`;

  io.createFile(actions, "actions");

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

  io.createFile(entity, "entity");

  let effects = `import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ${upperCaseName}Actions } from './${params.input}.actions';
import { ${upperCaseName}Service } from './${params.input}.service';

@Injectable()
export class ${upperCaseName}Effect {

    ${
      params.read
        ? `loadAll$ = createEffect(() =>
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
    `
        : ""
    }
    ${
      params.create
        ? `addNew$ = createEffect(() =>
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
    `
        : ""
    }
    ${
      params.update
        ? `update$ = createEffect(() =>
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
    `
        : ""
    }
    ${
      params.delete
        ? `delete$ = createEffect(() =>
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
    ));`
        : ""
    }

    constructor(
        private action$: Actions,
        private service: ${upperCaseName}Service
      ) { }

}
`;

  io.createFile(effects, "effects");

  let reducer = `import { Action, createReducer, on } from '@ngrx/store';
import { ${upperCaseName}Actions } from './${params.input}.actions';
import { ${lowerCaseName}Adapter, initialState, ${lowerCaseName}State, ${lowerCaseName}PartialState } from './${
    params.input
  }.entity';

export class ${upperCaseName}Reducer {
    static _reducer = createReducer(initialState,
        ${
          params.read
            ? `on(${upperCaseName}Actions.loadAll, (state) => ({
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
        `
            : ""
        }${
    params.create
      ? `on(${upperCaseName}Actions.addNew${upperCaseName}, (state) => ({
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
        })),`
      : ""
  }${
    params.update
      ? `on(${upperCaseName}Actions.update${upperCaseName}, (state) => ({
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
        })),`
      : ""
  }${
    params.delete
      ? `on(${upperCaseName}Actions.delete${upperCaseName}, (state) => ({
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
        })),`
      : ""
  }
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

  io.createFile(reducer, "reducer");

  let selectors = `import { createFeatureSelector, createSelector } from "@ngrx/store";
import { ${featureKey}, ${lowerCaseName}State, ${lowerCaseName}Adapter } from "./${params.input}.entity";
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

  io.createFile(selectors, "selectors");

  let service = `import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { HttpClient } from "@angular/common/http";

import { ${featureKey} } from "./${params.input}.entity";
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
      environment.baseApiUrl + ${"`postPath/${id}/update`"},
      data
    );
  }

  delete(id):Observable<any>{
    return this.http.post<any>(
        environment.baseApiUrl + ${"`postPath/${id}/delete`"},{});
  }
}
`;

  io.createFile(service, "service");

  if (params.facade) {
    let facade = `import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { ${upperCaseName}Actions } from './${params.input}.actions';
import { ${lowerCaseName}PartialState , ${featureKey} } from './${
      params.input
    }.entity';
import { ${upperCaseName}Selectors } from './${params.input}.selectors';

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

    ${
      params.read
        ? `loadAll() {
        this.store.dispatch(${upperCaseName}Actions.loadAll());
    }
    `
        : ""
    }
    ${
      params.update
        ? `update(id:any,data:any) {
        this.store.dispatch(${upperCaseName}Actions.update${upperCaseName}({id,data}));
    }
    `
        : ""
    }
    ${
      params.create
        ? `addNew(data:any) {
        this.store.dispatch(${upperCaseName}Actions.addNew${upperCaseName}({data}));
    }
    `
        : ""
    }
    ${
      params.delete
        ? `delete(id:any) {
        this.store.dispatch(${upperCaseName}Actions.delete${upperCaseName}({id}));
    }
    `
        : ""
    }
}
    `;

    io.createFile(facade, "facade");

    let module = `import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { ${upperCaseName}Effect } from './${params.input}.effects';
import { ${featureKey} } from './${params.input}.entity';
import { ${upperCaseName}Service } from './${params.input}.service';
import { ${upperCaseName}Facade } from './${params.input}.facade';
import { ${upperCaseName}Reducer } from './${params.input}.reducer';
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

    io.createFile(module, "module");

    let index = `export { ${upperCaseName}Facade } from './${params.input}.facade';
export { ${upperCaseName}StateModule } from './${params.input}-state.module';
export { ${upperCaseName}Service } from './${params.input}.service';
`;

    io.createFile(index, "index");
  }
}

run();
