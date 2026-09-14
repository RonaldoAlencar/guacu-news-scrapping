import { NewsItem } from "./NewsItem";

export default class News {
  constructor(
    readonly id: string,
    readonly title: string,
    readonly link: string,
    readonly postedAt: string,
    readonly source: string,
    readonly city: string,
    readonly published = false,
  ) {}

  static fromItem(item: NewsItem, id = "", published = false): News {
    return new News(id, item.title, item.link, item.postedAt, item.source, item.city, published);
  }

  toItem(): NewsItem {
    return {
      title: this.title,
      link: this.link,
      postedAt: this.postedAt,
      source: this.source,
      city: this.city,
    };
  }
}
