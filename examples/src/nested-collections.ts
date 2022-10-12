import { NearBindgen, near, call, view, UnorderedMap } from "near-sdk-js";

@NearBindgen({})
export class Contract {
  outerMap: UnorderedMap<UnorderedMap<string>>;
  groups: UnorderedMap<UnorderedMap<UnorderedMap<string>>>;

  constructor() {
    this.outerMap = new UnorderedMap("o");
    this.groups = new UnorderedMap("gs");
  }

  @call({})
  add({ id, text }) {
    const innerMap = this.outerMap.get(id, {
      reconstructor: UnorderedMap.reconstruct,
      defaultValue: new UnorderedMap<string>("i_" + id + "_"),
    });
    innerMap.set(near.signerAccountId(), text);
    this.outerMap.set(id, innerMap);
  }

  @view({})
  get({ id, accountId }) {
    const innerMap = this.outerMap.get(id, {
      reconstructor: UnorderedMap.reconstruct,
    });
    if (innerMap === null) {
      return null;
    }
    return innerMap.get(accountId);
  }

  @call({})
  add_to_group({ group, id, text }) {
    const groupMap = this.groups.get(group, {
      reconstructor: UnorderedMap.reconstruct,
      defaultValue: new UnorderedMap<UnorderedMap<string>>("g_" + group + "_"),
    });
    const innerMap = groupMap.get(id, {
      reconstructor: UnorderedMap.reconstruct,
      defaultValue: new UnorderedMap<string>("gi_" + group + "_" + id + "_"),
    });
    innerMap.set(near.signerAccountId(), text);
    groupMap.set(id, innerMap);
    this.groups.set(group, groupMap);
  }

  @view({})
  get_from_group({ group, id, accountId }) {
    const groupMap = this.groups.get(group, {
      reconstructor: UnorderedMap.reconstruct,
    });
    if (groupMap === null) {
      return null;
    }
    const innerMap = groupMap.get(id, {
      reconstructor: UnorderedMap.reconstruct,
    });
    if (innerMap === null) {
      return null;
    }
    return innerMap.get(accountId);
  }
}
