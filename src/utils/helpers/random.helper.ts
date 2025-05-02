export class ESRandom {
  static randomNumber = (min: number, max: number, step = 1) => {
    const count = (max - min) / step + 1
    return Math.floor(Math.random() * count) * step + min
  }
}
