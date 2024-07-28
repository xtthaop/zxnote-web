export default function useImgLazyLoad(previewerRef) {
  let imgTimeoutId
  const imgsCacheMap = new Map()

  const loadImgFn = () => {
    if (imgTimeoutId || !previewerRef?.value) return

    imgTimeoutId = setTimeout(() => {
      previewerRef.value.addEventListener('scroll', loadImgFn)

      const previewerRect = previewerRef.value.getBoundingClientRect()
      const imgs = previewerRef.value.getElementsByTagName('img')
      const timestamp = Date.now()

      for (let i = 0; i < imgs.length; i++) {
        const img = imgs[i]
        const imgRect = img.getBoundingClientRect()

        const distance1 = previewerRect.height - imgRect.top
        const distance2 = imgRect.top + imgRect.height
        const inView = distance1 >= 0 && distance2 >= 0

        const imgSrc = img.getAttribute('data-src')

        // 判断缓存中是否有当前图片
        if (imgsCacheMap.has(imgSrc)) {
          // 更新时间戳标志
          imgsCacheMap.get(imgSrc).timestamp = timestamp
          // 是则判断图片是否已加载成功
          if (imgsCacheMap.get(imgSrc).status === 'loaded') {
            // 已加载成功则判断当前图片是否需要更新链接
            // 是则更新链接
            if (img.getAttribute('src') !== imgSrc) img.src = imgSrc
          } else {
            // 未加载成功则将当前图片添加到待更新链接图片集合中
            imgsCacheMap.get(imgSrc).needUpdateImgs.add(img)
          }
        } else {
          // 否则新建图片加载器
          const loader = new Image()
          // 缓存图片对应的加载器、加载状态、在视口内的图片集合、需要更新链接的图片集合、时间戳标志
          imgsCacheMap.set(imgSrc, {
            loader,
            status: 'start',
            someInView: new Set(),
            needUpdateImgs: new Set([img]),
            timestamp,
          })
        }

        // 判断当前图片是否在视口内
        if (inView) {
          // 是则将当前图片添加到在视口内的图片集合中
          imgsCacheMap.get(imgSrc).someInView.add(img)

          // 判断当前图片是否正在加载或已加载成功
          // 是则跳过加载操作
          // 图片加载失败后滑动页面待图片重新出现在视口内会重新发起加载请求
          if (
            imgsCacheMap.get(imgSrc).status === 'loading' ||
            imgsCacheMap.get(imgSrc).status === 'loaded'
          ) {
            continue
          }

          imgsCacheMap.get(imgSrc).loader.src = imgSrc
          imgsCacheMap.get(imgSrc).status = 'loading'
          imgsCacheMap.get(imgSrc).loader.onload = () => {
            // 图片加载成功后更新所有需要更新链接的图片然后立即从集合中删除该图片
            for (let img of imgsCacheMap.get(imgSrc).needUpdateImgs.values()) {
              img.src = imgSrc
              imgsCacheMap.get(imgSrc).needUpdateImgs.delete(img)
            }
            // 将图片状态更新为加载成功
            imgsCacheMap.get(imgSrc).status = 'loaded'
          }
          imgsCacheMap.get(imgSrc).loader.onerror = () => {
            // 图片加载失败则将图片状态更新为加载失败
            imgsCacheMap.get(imgSrc).status = 'error'
          }
        } else {
          // 当前图片不在视口内则将其从在视口内的图片集合中删除
          imgsCacheMap.get(imgSrc).someInView.delete(img)

          // 判断图片加载状态是否为加载中
          // 及在视口内的图片集合是否为空
          if (
            imgsCacheMap.get(imgSrc).status === 'loading' &&
            imgsCacheMap.get(imgSrc).someInView.size === 0
          ) {
            // 是则将图片的加载器请求链接置为空
            // 目的是取消图片加载从而加快后续进入视口图片的加载速度
            // 此时图片的加载状态会变为加载失败
            // 待图片回到视口内会重新加载
            imgsCacheMap.get(imgSrc).loader.src = ''
          }
        }
      }

      for (let [key, val] of imgsCacheMap.entries()) {
        if (val.timestamp !== timestamp) {
          imgsCacheMap.delete(key)
        }
      }

      imgTimeoutId = undefined
    }, 200)
  }

  return { loadImgFn }
}
