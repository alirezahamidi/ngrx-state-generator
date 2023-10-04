#!/usr/bin/env node
const io = require("./io");
const fs = require("fs");
function run() {
  if (io.init() < 0) return;
  let upperCaseName = io.upperCaseName;
  let lowerCaseName = io.lowerCaseName;
  let featureKey = io.featureKey;

  let model = `
  export interface ${io.names.model.className} {
    id:number;
    name:string;
  }`;

  io.createFile(model, io.names.model.fileName);

  let actions = `
import { createAction, props } from "@ngrx/store";
import { ${io.names.model.className} } from "${io.names.model.fileName}";

export class ${io.names.actions.className} {
    ${
      io.create
        ? `static addNew${upperCaseName} = createAction('[${upperCaseName}] Add New ${upperCaseName}', props<{ data: ${io.names.model.className} }>());

    static ${lowerCaseName}Added = createAction('[${upperCaseName}] New ${upperCaseName} Added', props<{ data: ${io.names.model.className} }>());
    `
        : ""
    }
    ${
      io.read
        ? `static loadAll = createAction('[${upperCaseName}] Load All Data');

    static loaded = createAction('[${upperCaseName}] All Data Loaded', props<{ data: ${io.names.model.className}[] }>());
    `
        : ""
    }
    ${
      io.update
        ? `static update${upperCaseName} = createAction('[${upperCaseName}] Update ${upperCaseName}', props<{ data: ${io.names.model.className} , id: number}>());

    static ${lowerCaseName}Updated = createAction('[${upperCaseName}] ${upperCaseName} Updated', props<{ data: ${io.names.model.className} }>());
    `
        : ""
    }
    ${
      io.delete
        ? `static delete${upperCaseName} = createAction('[${upperCaseName}] Delete ${upperCaseName}', props<{ id: number}>());

    static ${lowerCaseName}Deleted = createAction('[${upperCaseName}] ${upperCaseName} Deleted', props<{ data: ${io.names.model.className} }>());
    `
        : ""
    }
    static error = createAction('[${upperCaseName}] Error Occurred', props<{ reason: any }>());
}
`;

  io.createFile(actions, io.names.actions.fileName);

  let entity = `
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { ${io.names.model.className} } from '${io.names.model.fileName}';

export const ${featureKey} = "${lowerCaseName}";

export interface ${lowerCaseName}State extends EntityState<${io.names.model.className}>{
    loaded: boolean;
    message: any;
    statistics: any[];
    error: any;
    submitted: boolean;
}


export const ${lowerCaseName}Adapter : EntityAdapter<${io.names.model.className}> = createEntityAdapter<${io.names.model.className}>();

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

  io.createFile(entity, io.names.entity.fileName);

  let effects = `
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ${io.names.actions.className} } from './${io.names.actions.fileName}';
import { ${io.names.service.className} } from './${io.names.service.fileName}';

@Injectable()
export class ${io.names.effects.className} {

    ${
      io.read
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
      io.create
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
      io.update
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
      io.delete
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
        private service: ${io.names.service.className}
      ) { }

}
`;

  io.createFile(effects, io.names.effects.fileName);

  let reducer = `
import { Action, createReducer, on } from '@ngrx/store';
import { ${io.names.actions.className} } from './${io.names.actions.fileName}';
import { ${lowerCaseName}Adapter, initialState, ${lowerCaseName}State, ${lowerCaseName}PartialState } from '${
    io.names.entity.fileName
  }';

export class ${io.names.reducer.className} {
    static _reducer = createReducer(initialState,
        ${
          io.read
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
    io.create
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
    io.update
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
    io.delete
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

  io.createFile(reducer, io.names.reducer.fileName);

  let selectors = `
import { createFeatureSelector, createSelector } from "@ngrx/store";
import { ${featureKey}, ${lowerCaseName}State, ${lowerCaseName}Adapter } from "${io.names.entity.fileName}";
const { selectAll } = ${lowerCaseName}Adapter.getSelectors();

export class ${io.names.selectors.className} {
    static featureSelector = createFeatureSelector<${lowerCaseName}State>(${featureKey});

    static data = createSelector(${io.names.selectors.className}.featureSelector, (state) => selectAll(state));

    static loaded = createSelector(${io.names.selectors.className}.featureSelector, (state) => state.loaded);

    static message = createSelector(${io.names.selectors.className}.featureSelector, (state) => state.message);

    static statistics = createSelector(${io.names.selectors.className}.featureSelector, (state) => state.statistics);

    static error = createSelector(${io.names.selectors.className}.featureSelector, (state) => state.error);

    static submitted = createSelector(${io.names.selectors.className}.featureSelector, (state) => state.submitted);
}`;

  io.createFile(selectors, io.names.selectors.fileName);

  let service = `import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { HttpClient } from "@angular/common/http";
import { ${io.names.model.className} } from '${io.names.model.fileName}';

import { ${featureKey} } from "${io.names.entity.fileName}";
@Injectable()
export class ${io.names.service.className} {

  constructor(
    private http: HttpClient
  ) {  }

  loadAll(): Observable<${io.names.model.className}[]> {
    return this.http.get<${io.names.model.className}[]>(
      environment.baseApiUrl
    );
  }

  addNew(data:${io.names.model.className}): Observable<${
    io.names.model.className
  }> {
    return this.http.post<${io.names.model.className}>(
      environment.baseApiUrl + 'postPath',
      data
    );
  }

  update(data, id: number): Observable<${io.names.model.className}> {
    return this.http.post<${io.names.model.className}>(
      environment.baseApiUrl + ${"`postPath/${id}/update`"},
      data
    );
  }

  delete(id):Observable<${io.names.model.className}>{
    return this.http.post<${io.names.model.className}>(
        environment.baseApiUrl + ${"`postPath/${id}/delete`"},{});
  }
}
`;

  io.createFile(service, io.names.service.fileName);

  if (io.facade) {
    let facade = `
import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { ${io.names.actions.className} } from '${io.names.actions.fileName}';
import { ${lowerCaseName}PartialState , ${featureKey} } from '${
      io.names.entity.fileName
    }';
import { ${io.names.selectors.className} } from '${
      io.names.selectors.fileName
    }';
import { ${io.names.model.className} } from '${io.names.model.fileName}';

@Injectable()
export class ${io.names.facade.className} {
    ${lowerCaseName}$ = this.store.pipe(select(${
      io.names.selectors.className
    }.data));

    loaded$ = this.store.pipe(select(${io.names.selectors.className}.loaded));

    message$ = this.store.pipe(select(${io.names.selectors.className}.message));

    statistics$ = this.store.pipe(select(${
      io.names.selectors.className
    }.statistics));

    error$ = this.store.pipe(select(${io.names.selectors.className}.error));

    submitted$ = this.store.pipe(select(${
      io.names.selectors.className
    }.submitted));

    name = ${featureKey};

    constructor(
        private store: Store<${lowerCaseName}PartialState>
    ) {
        this.loadAll();
    }

    ${
      io.read
        ? `loadAll() {
        this.store.dispatch(${upperCaseName}Actions.loadAll());
    }
    `
        : ""
    }
    ${
      io.update
        ? `update(id:number,data:${io.names.model.className}) {
        this.store.dispatch(${upperCaseName}Actions.update${upperCaseName}({id,data}));
    }
    `
        : ""
    }
    ${
      io.create
        ? `addNew(data:${io.names.model.className}) {
        this.store.dispatch(${upperCaseName}Actions.addNew${upperCaseName}({data}));
    }
    `
        : ""
    }
    ${
      io.delete
        ? `delete(id:number) {
        this.store.dispatch(${upperCaseName}Actions.delete${upperCaseName}({id}));
    }
    `
        : ""
    }
}
    `;

    io.createFile(facade, io.names.facade.fileName);

    let module = `
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { CommonModule } from "@angular/common";
import { StoreModule } from '@ngrx/store';
import { ${io.names.effects.className} } from '${io.names.effects.fileName}';
import { ${io.names.service.className} } from '${io.names.service.fileName}';
import { ${io.names.facade.className} } from '${io.names.facade.fileName}';
import { ${io.names.reducer.className} } from '${io.names.reducer.fileName}';
import { ${featureKey} } from '${io.names.entity.fileName}';

@NgModule({
    imports: [
    StoreModule.forFeature(
        ${featureKey},
        ${io.names.reducer.className}.reducer
    ),
    EffectsModule.forFeature([${io.names.effects.className}]),
    CommonModule
    ],
    providers: [${io.names.facade.className}, ${io.names.service.className}]
})
export class ${io.names.module.className} {}`;

    io.createFile(module, io.names.module.fileName);

    let index = `
export { ${io.names.facade.className} } from '${io.names.facade.fileName}';
export { ${io.names.module.className} } from '${io.names.module.fileName}';
export { ${io.names.service.className} } from '${io.names.service.fileName}';
export { ${io.names.model.className} } from '${io.names.model.fileName}';
`;

    io.createFile(index, "index");
  }
}

run();
